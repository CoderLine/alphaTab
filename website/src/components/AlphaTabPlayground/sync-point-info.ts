import type * as alphaTab from '@coderline/alphatab';
import type { HTMLMediaElementLike } from './helpers';

export enum SyncPointMarkerType {
    StartMarker = 0,
    EndMarker = 1,
    MasterBar = 2,
    Intermediate = 3
}

export type SyncPointMarker = {
    syncTime: number;

    synthTime: number;
    synthBpm: number;
    synthTick: number;

    masterBarIndex: number;
    ratioPosition: number;
    occurence: number;
    modifiedTempo?: number;

    markerType: SyncPointMarkerType;
};

export type SyncPointInfo = {
    endTick: number;
    endTime: number;
    sampleRate: number;
    leftSamples: Float32Array;
    rightSamples: Float32Array;
    syncPointMarkers: SyncPointMarker[];
};


function ticksToMilliseconds(tick: number, bpm: number): number {
    return (tick * 60000.0) / (bpm * 960);
}

export function buildSyncPointInfoFromYoutube(
    api: alphaTab.AlphaTabApi,
    youtubePlayer: HTMLMediaElementLike | undefined,
): SyncPointInfo | undefined {
    const tickCache = api.tickCache;
    if (!tickCache || !youtubePlayer || youtubePlayer.duration < 1) {
        return undefined;
    }

    const state: SyncPointInfo = {
        endTick: api.tickCache.masterBars.at(-1)!.end,
        syncPointMarkers: [],
        sampleRate: 44100,
        leftSamples: new Float32Array(0),
        rightSamples: new Float32Array(0),
        endTime: youtubePlayer.duration * 1000
    };

    const createInitialSyncPoints = !api.score!.masterBars.some(m => m.syncPoints && m.syncPoints.length > 0);
    if (createInitialSyncPoints) {
        return autoSync(state, api, false);
    }

    state.syncPointMarkers = buildSyncPointMarkers(api);
    return state;
}

export function buildSyncPointInfoFromSynth(
    api: alphaTab.AlphaTabApi,
): SyncPointInfo | undefined {
    const tickCache = api.tickCache;
    if (!tickCache) {
        return undefined;
    }

    let synthBpm = api.score!.tempo;
    let synthTimePosition = 0;
    let synthTickPosition = 0;

    for (const masterBar of api.tickCache!.masterBars) {
        let tickOffset = masterBar.start - synthTickPosition;
        // and then we walk through the tempo changes
        for (const changes of masterBar.tempoChanges) {
            const absoluteTick = changes.tick;
            const tickOffset = absoluteTick - synthTickPosition;
            if (tickOffset > 0) {
                const timeOffset = ticksToMilliseconds(tickOffset, synthBpm);

                synthTickPosition = absoluteTick;
                synthTimePosition += timeOffset;
            }

            synthBpm = changes.tempo;
        }

        // don't forget the part after the last tempo change
        tickOffset = masterBar.end - synthTickPosition;
        const timeOffset = ticksToMilliseconds(tickOffset, synthBpm);
        synthTickPosition += tickOffset;
        synthTimePosition += timeOffset;
    }

    const state: SyncPointInfo = {
        endTick: api.tickCache.masterBars.at(-1)!.end,
        syncPointMarkers: [],
        sampleRate: 44100,
        leftSamples: new Float32Array(0),
        rightSamples: new Float32Array(0),
        endTime: synthTimePosition
    };


    state.syncPointMarkers = [];
    return state;
}

export async function buildSyncPointInfoFromAudio(
    api: alphaTab.AlphaTabApi
): Promise<SyncPointInfo | undefined> {
    const tickCache = api.tickCache;
    if (!tickCache || !api.score?.backingTrack?.rawAudioFile) {
        return undefined;
    }

    const audioContext = new AudioContext();
    const buffer = await audioContext.decodeAudioData(api.score!.backingTrack!.rawAudioFile.buffer.slice(0));
    const rawSamples: Float32Array[] =
        buffer.numberOfChannels === 1
            ? [buffer.getChannelData(0), buffer.getChannelData(0)]
            : [buffer.getChannelData(0), buffer.getChannelData(1)];

    const sampleRate = audioContext.sampleRate;
    const endTime = (rawSamples[0].length / sampleRate) * 1000;

    await audioContext.close();

    const state: SyncPointInfo = {
        endTick: api.tickCache.masterBars.at(-1)!.end,
        syncPointMarkers: [],
        sampleRate,
        leftSamples: rawSamples[0],
        rightSamples: rawSamples[1],
        endTime
    };

    const createInitialSyncPoints = !api.score.masterBars.some(m => m.syncPoints && m.syncPoints.length > 0);
    if (createInitialSyncPoints) {
        return autoSync(state, api);
    }

    state.syncPointMarkers = buildSyncPointMarkers(api);
    return state;
}

function buildSyncPointMarkers(api: alphaTab.AlphaTabApi): SyncPointMarker[] {
    const markers: SyncPointMarker[] = [];

    const occurences = new Map<number, number>();
    let syncBpm = api.score!.tempo;
    let syncLastTick = 0;
    let syncLastMillisecondOffset = 0;

    let synthBpm = api.score!.tempo;
    let synthTimePosition = 0;
    let synthTickPosition = 0;

    for (const masterBar of api.tickCache!.masterBars) {
        const occurence = occurences.get(masterBar.masterBar.index) ?? 0;
        occurences.set(masterBar.masterBar.index, occurence + 1);

        const duration = masterBar.end - masterBar.start;

        if (masterBar.masterBar.syncPoints) {
            // if we have sync points we have to correctly walk through the points and tempo changes
            // and place the markers accordingly

            // TODO: create placeholder markers matching the time signature and relative offsets.

            let tempoChangeIndex = 0;
            for (const syncPoint of masterBar.masterBar.syncPoints) {
                if (syncPoint.syncPointValue!.barOccurence !== occurence) {
                    continue;
                }

                const syncPointTick = masterBar.start + syncPoint.ratioPosition * duration;

                // first process all tempo change until this sync point
                while (
                    tempoChangeIndex < masterBar.tempoChanges.length &&
                    masterBar.tempoChanges[tempoChangeIndex].tick <= syncPointTick
                ) {
                    const tempoChange = masterBar.tempoChanges[tempoChangeIndex];
                    const absoluteTick = tempoChange.tick;
                    const tickOffset = absoluteTick - synthTickPosition;
                    if (tickOffset > 0) {
                        const timeOffset = ticksToMilliseconds(tickOffset, synthBpm);
                        synthTickPosition = absoluteTick;
                        synthTimePosition += timeOffset;
                    }

                    synthBpm = tempoChange.tempo;
                    tempoChangeIndex++;
                }

                // process time until sync point
                const tickOffset = syncPointTick - synthTickPosition;
                if (tickOffset > 0) {
                    synthTickPosition = syncPointTick;
                    const timeOffset = ticksToMilliseconds(tickOffset, synthBpm);
                    synthTimePosition += timeOffset;
                }

                // create sync point marker
                const newMarker: SyncPointMarker = {
                    masterBarIndex: masterBar.masterBar.index,
                    occurence: occurence,
                    syncTime: syncPoint.syncPointValue!.millisecondOffset,
                    synthTime: synthTimePosition,
                    synthBpm: masterBar.tempoChanges[0].tempo,
                    modifiedTempo: syncPoint!.syncPointValue!.modifiedTempo,
                    markerType:
                        syncPoint.ratioPosition === 0
                            ? SyncPointMarkerType.MasterBar
                            : SyncPointMarkerType.Intermediate,
                    ratioPosition: syncPoint.ratioPosition,
                    synthTick: synthTickPosition
                };
                if (syncPointTick === 0) {
                    newMarker.markerType = SyncPointMarkerType.StartMarker;
                }
                markers.push(newMarker);

                // remember values for artificially generated markers
                syncBpm = syncPoint.syncPointValue!.modifiedTempo;
                syncLastMillisecondOffset = syncPoint.syncPointValue!.millisecondOffset;
                syncLastTick = masterBar.start;
            }

            // process remaining tempo changes after all sync points
            while (tempoChangeIndex < masterBar.tempoChanges.length) {
                const tempoChange = masterBar.tempoChanges[tempoChangeIndex];
                const absoluteTick = tempoChange.tick;
                const tickOffset = absoluteTick - synthTickPosition;
                if (tickOffset > 0) {
                    const timeOffset = ticksToMilliseconds(tickOffset, synthBpm);
                    synthTickPosition = absoluteTick;
                    synthTimePosition += timeOffset;
                }

                synthBpm = tempoChange.tempo;
                tempoChangeIndex++;
            }
        } else {
            // TODO: Create intermediate markers matching time signature

            // if there are no sync points, we create a main masterbar sync point marker at start
            let tickOffset = masterBar.start - syncLastTick;

            const newMarker: SyncPointMarker = {
                masterBarIndex: masterBar.masterBar.index,
                occurence: occurence,
                syncTime: syncLastMillisecondOffset + ticksToMilliseconds(tickOffset, syncBpm),
                synthTime: synthTimePosition,
                synthTick: synthTickPosition,
                synthBpm: masterBar.tempoChanges[0].tempo,
                modifiedTempo: undefined,
                markerType: masterBar.start === 0 ? SyncPointMarkerType.StartMarker : SyncPointMarkerType.MasterBar,
                ratioPosition: 0
            };

            if (newMarker.markerType === SyncPointMarkerType.StartMarker) {
                newMarker.modifiedTempo = syncBpm;
            }

            markers.push(newMarker);

            // and then we walk through the tempo changes
            for (const changes of masterBar.tempoChanges) {
                const absoluteTick = changes.tick;
                const tickOffset = absoluteTick - synthTickPosition;
                if (tickOffset > 0) {
                    const timeOffset = ticksToMilliseconds(tickOffset, synthBpm);

                    synthTickPosition = absoluteTick;
                    synthTimePosition += timeOffset;
                }

                synthBpm = changes.tempo;
            }

            // don't forget the part after the last tempo change
            tickOffset = masterBar.end - synthTickPosition;
            const timeOffset = ticksToMilliseconds(tickOffset, synthBpm);
            synthTickPosition += tickOffset;
            synthTimePosition += timeOffset;
        }
    }

    // at the very end we create the end marker
    const lastMasterBar = api.tickCache!.masterBars.at(-1)!;
    const endSyncPoint = lastMasterBar.masterBar.syncPoints?.find(m => m.ratioPosition === 1);

    const tickOffset = lastMasterBar.end - syncLastTick;
    const endSyncPointTime = endSyncPoint
        ? endSyncPoint.syncPointValue!.millisecondOffset
        : syncLastMillisecondOffset + ticksToMilliseconds(tickOffset, syncBpm);

    markers.push({
        masterBarIndex: lastMasterBar.masterBar.index,
        occurence: occurences.get(lastMasterBar.masterBar.index)! - 1,
        syncTime: endSyncPointTime,
        synthTime: synthTimePosition,
        synthBpm,
        modifiedTempo: endSyncPoint?.syncPointValue?.modifiedTempo ?? synthBpm,
        markerType: SyncPointMarkerType.EndMarker,
        ratioPosition: 1,
        synthTick: synthTickPosition
    });

    return markers;
}

function findAudioStartAndEnd(state: SyncPointInfo): [number, number] {
    // once we have 1s non-silent audio we consider it as start (or inverted for end)
    const nonSilentSamplesThreshold = 1 * state.sampleRate;
    // we accept 200ms of silence inbetween audible samples
    const silentSamplesThreshold = 0.2 * state.sampleRate;
    // there can always be a bit of a noise. we require some amplitude
    // proper would be to consider the Frequency and calculate the
    const nonSilentAmplitudeThreshold = 0.001;

    // we limit the search to 10s (from start/end), proper audio should not exceed this
    const searchThreshold = Math.min(10 * state.sampleRate, state.leftSamples.length * 0.1);

    let songStart = searchThreshold;
    let songEnd = state.leftSamples.length - searchThreshold;

    // find start offset
    let sampleIndex = 0;

    let nonSilentSamplesInSection = 0;
    let silentSamplesInSequence = 0;
    let sectionStart = 0;

    while (sampleIndex < songStart) {
        if (
            Math.abs(state.leftSamples[sampleIndex]) >= nonSilentAmplitudeThreshold ||
            Math.abs(state.rightSamples[sampleIndex]) >= nonSilentAmplitudeThreshold
        ) {
            // the first audible sample marks the potential start
            if (nonSilentSamplesInSection === 0) {
                sectionStart = sampleIndex;
            }
            nonSilentSamplesInSection++;
            silentSamplesInSequence = 0;
        } else {
            silentSamplesInSequence++;
        }

        // found more than X-samples silent, no start until here
        if (silentSamplesInSequence > silentSamplesThreshold) {
            // reset and start searching agian
            sectionStart = sampleIndex + 1;
            nonSilentSamplesInSection = 0;
            silentSamplesInSequence = 0;
        }
        // found enough samples since section start which are audible, should be good
        else if (nonSilentSamplesInSection > nonSilentSamplesThreshold) {
            songStart = sectionStart;
            break;
        }

        sampleIndex++;
    }

    // and same from the back
    sampleIndex = state.leftSamples.length - 1;
    nonSilentSamplesInSection = 0;
    silentSamplesInSequence = 0;
    sectionStart = sampleIndex;

    while (sampleIndex >= songEnd) {
        if (
            Math.abs(state.leftSamples[sampleIndex]) >= nonSilentAmplitudeThreshold ||
            Math.abs(state.rightSamples[sampleIndex]) >= nonSilentAmplitudeThreshold
        ) {
            if (nonSilentSamplesInSection === 0) {
                sectionStart = sampleIndex;
            }
            nonSilentSamplesInSection++;
            silentSamplesInSequence = 0;
        } else {
            silentSamplesInSequence++;
        }

        if (silentSamplesInSequence > silentSamplesThreshold) {
            sectionStart = sampleIndex - 1;
            nonSilentSamplesInSection = 0;
            silentSamplesInSequence = 0;
        } else if (nonSilentSamplesInSection > nonSilentSamplesThreshold) {
            songEnd = sectionStart;
            break;
        }

        sampleIndex--;
    }

    return [(songStart / state.sampleRate) * 1000, (songEnd / state.sampleRate) * 1000];
}

export function autoSync(oldState: SyncPointInfo, api: alphaTab.AlphaTabApi, padToAudio: boolean = true): SyncPointInfo {
    const state: SyncPointInfo = {
        endTick: api.tickCache!.masterBars.at(-1)!.end,
        syncPointMarkers: [],
        sampleRate: oldState.sampleRate,
        leftSamples: oldState.leftSamples,
        rightSamples: oldState.rightSamples,
        endTime: oldState.endTime
    };

    // create initial sync points for all tempo changes to ensure the song and the
    // backing track roughly align
    let synthBpm = api.tickCache!.masterBars[0].tempoChanges[0].tempo;
    let synthTimePosition = 0;
    let synthTickPosition = 0;

    const syncPoints: SyncPointMarker[] = [];

    // first create all changes not respecting the song start and end
    const occurences = new Map<number, number>();
    for (const masterBar of api.tickCache!.masterBars) {
        const occurence = occurences.get(masterBar.masterBar.index) ?? 0;
        occurences.set(masterBar.masterBar.index, occurence + 1);

        // we are guaranteed to have a tempo change per master bar indicating its own tempo
        // (even though its not a change)
        for (const changes of masterBar.tempoChanges) {
            const absoluteTick = changes.tick;
            const tickOffset = absoluteTick - synthTickPosition;
            if (tickOffset > 0) {
                const timeOffset = ticksToMilliseconds(tickOffset, synthBpm);
                synthTickPosition = absoluteTick;
                synthTimePosition += timeOffset;
            }

            const marker: SyncPointMarker = {
                markerType: SyncPointMarkerType.MasterBar,
                masterBarIndex: masterBar.masterBar.index,
                occurence,
                syncTime: synthTimePosition,
                synthBpm,
                synthTime: synthTimePosition,
                modifiedTempo: undefined,
                ratioPosition: 0,
                synthTick: synthTickPosition
            };

            if (masterBar.start === 0) {
                marker.markerType = SyncPointMarkerType.StartMarker;
            } else if (changes.tick > masterBar.start) {
                marker.markerType = SyncPointMarkerType.Intermediate;
                const duration = masterBar.end - masterBar.start;
                marker.ratioPosition = (changes.tick - masterBar.start) / duration;
            }

            if (changes.tempo !== synthBpm || marker.markerType === SyncPointMarkerType.StartMarker) {
                syncPoints.push(marker);
                marker.modifiedTempo = changes.tempo;
            }

            synthBpm = changes.tempo;

            state.syncPointMarkers.push(marker);
        }

        const tickOffset = masterBar.end - synthTickPosition;
        const timeOffset = ticksToMilliseconds(tickOffset, synthBpm);
        synthTickPosition += tickOffset;
        synthTimePosition += timeOffset;
    }

    // end marker
    const lastMasterBar = api.tickCache!.masterBars.at(-1)!;
    state.syncPointMarkers.push({
        masterBarIndex: lastMasterBar.masterBar.index,
        occurence: occurences.get(lastMasterBar.masterBar.index)! - 1,
        syncTime: synthTimePosition,
        synthTime: synthTimePosition,
        synthBpm,
        modifiedTempo: synthBpm,
        markerType: SyncPointMarkerType.EndMarker,
        ratioPosition: 1,
        synthTick: synthTickPosition
    });

    // with the final durations known, we can "squeeze" together the song
    // from start and end (keeping the relative positions)
    // and the other bars will be adjusted accordingly
    if (padToAudio) {
        const [songStart, songEnd] = findAudioStartAndEnd(state);

        const synthDuration = synthTimePosition;
        const realDuration = songEnd - songStart;
        const scaleFactor = realDuration / synthDuration;

        // 1st Pass: shift all tempo change markers relatively and calculate BPM
        let syncTime = songStart;
        for (let i = 0; i < syncPoints.length; i++) {
            const syncPoint = syncPoints[i];

            syncPoint.syncTime = syncTime;

            if (i < 0) {
                const previousMarker = syncPoints[i - 1];
                const synthDuration = syncPoint.synthTime - previousMarker.synthTime;
                const syncedDuration = syncPoint.syncTime - previousMarker.syncTime;
                const newBpm = (synthDuration / syncedDuration) * previousMarker.synthBpm;
                previousMarker.modifiedTempo = newBpm;
            }

            const ownStart = syncPoint.synthTime;
            const nextStart = i < syncPoints.length - 1 ? syncPoints[i + 1].synthTime : ownStart;

            const oldDuration = nextStart - ownStart;
            const newDuration = oldDuration * scaleFactor;

            syncTime += newDuration;
        }

        // 2nd Pass: adjust all in-between markers according to the new position
        syncTime = songStart;
        let syncedBpm = syncPoints[0].modifiedTempo!;
        for (let i = 0; i < state.syncPointMarkers.length; i++) {
            const marker = state.syncPointMarkers[i];
            marker.syncTime = syncTime;

            if (marker.modifiedTempo) {
                syncedBpm = marker.modifiedTempo;
            }

            if (i < state.syncPointMarkers.length - 1) {
                const tickDiff = state.syncPointMarkers[i + 1].synthTick - marker.synthTick;
                syncTime += ticksToMilliseconds(tickDiff, syncedBpm);
            }
        }
    }

    return state;
}

export function updateSyncPointsAfterModification(
    modifiedIndex: number,
    s: SyncPointInfo,
    isDelete: boolean,
    cloneMarkers: boolean
) {
    // find previous and next sync point (or start/end of the song)
    let startIndexForUpdate = Math.max(0, modifiedIndex - 1);
    while (startIndexForUpdate > 0 && !s.syncPointMarkers[startIndexForUpdate].modifiedTempo) {
        startIndexForUpdate--;
    }

    let nextIndexForUpdate = Math.min(s.syncPointMarkers.length - 1, modifiedIndex + 1);
    while (
        nextIndexForUpdate < s.syncPointMarkers.length - 1 &&
        !s.syncPointMarkers[nextIndexForUpdate].modifiedTempo
    ) {
        nextIndexForUpdate++;
    }

    const modifiedMarker = s.syncPointMarkers[modifiedIndex];

    // update from previous to current
    if (startIndexForUpdate < modifiedIndex) {
        const previousMarker = cloneMarkers
            ? { ...s.syncPointMarkers[startIndexForUpdate] }
            : s.syncPointMarkers[startIndexForUpdate];
        s.syncPointMarkers[startIndexForUpdate] = previousMarker;
        const synthDuration = modifiedMarker.synthTime - previousMarker.synthTime;
        const syncedDuration = modifiedMarker.syncTime - previousMarker.syncTime;
        const newBpmBefore = (synthDuration / syncedDuration) * previousMarker.synthBpm;
        previousMarker.modifiedTempo = newBpmBefore;

        let syncedTimePosition = previousMarker.syncTime;
        for (let i = startIndexForUpdate; i < modifiedIndex; i++) {
            const marker = cloneMarkers ? { ...s.syncPointMarkers[i] } : s.syncPointMarkers[i];
            s.syncPointMarkers[i] = marker;

            marker.syncTime = syncedTimePosition;

            if (i < modifiedIndex - 1) {
                const tickDuration = s.syncPointMarkers[i + 1].synthTick - marker.synthTick;
                syncedTimePosition += ticksToMilliseconds(tickDuration, newBpmBefore);
            }
        }
    }

    if (!isDelete && nextIndexForUpdate > modifiedIndex) {
        const nextMarker = s.syncPointMarkers[nextIndexForUpdate];
        const synthDuration = nextMarker.synthTime - modifiedMarker.synthTime;
        const syncedDuration = nextMarker.syncTime - modifiedMarker.syncTime;
        const newBpmAfter = syncedDuration > 0 ? (synthDuration / syncedDuration) * modifiedMarker.synthBpm : 0;
        modifiedMarker.modifiedTempo = newBpmAfter;

        const tickDuration = s.syncPointMarkers[modifiedIndex + 1].synthTick - modifiedMarker.synthTick;
        let syncedTimePosition = modifiedMarker.syncTime + ticksToMilliseconds(tickDuration, newBpmAfter);

        for (let i = modifiedIndex + 1; i < nextIndexForUpdate; i++) {
            const marker = cloneMarkers ? { ...s.syncPointMarkers[i] } : s.syncPointMarkers[i];
            s.syncPointMarkers[i] = marker;
            marker.syncTime = syncedTimePosition;

            if (i < nextIndexForUpdate - 1) {
                const tickDuration = s.syncPointMarkers[i + 1].synthTick - marker.synthTick;
                syncedTimePosition += ticksToMilliseconds(tickDuration, newBpmAfter);
            }
        }
    }
}

export function moveMarker(s: SyncPointInfo, marker: SyncPointMarker, newTimePosition: number): SyncPointInfo {
    const markerIndex = s.syncPointMarkers.findIndex(m => m === marker);

    const newS: SyncPointInfo = { ...s, syncPointMarkers: [...s.syncPointMarkers] };

    // move the marker to the new position
    newS.syncPointMarkers[markerIndex] = {
        ...newS.syncPointMarkers[markerIndex],
        syncTime: Math.max(0, newTimePosition)
    };

    updateSyncPointsAfterModification(markerIndex, newS, false, true);
    return newS;
}

export function toggleMarker(s: SyncPointInfo, marker: SyncPointMarker): SyncPointInfo {
    // no removal of start and end marker
    if (
        marker.markerType === SyncPointMarkerType.StartMarker ||
        marker.markerType === SyncPointMarkerType.EndMarker
    ) {
        return s;
    }

    const markerIndex = s!.syncPointMarkers.indexOf(marker);
    if (markerIndex === -1) {
        return s;
    }

    const newS: SyncPointInfo = { ...s, syncPointMarkers: [...s.syncPointMarkers] };
    if (marker.modifiedTempo) {
        switch (marker.markerType) {
            case SyncPointMarkerType.MasterBar:
                newS.syncPointMarkers[markerIndex] = { ...marker, modifiedTempo: undefined };
                break;
            case SyncPointMarkerType.Intermediate:
                newS.syncPointMarkers.splice(markerIndex, 1);
                break;
        }
        updateSyncPointsAfterModification(markerIndex, newS, true, true);
    } else {
        updateSyncPointsAfterModification(markerIndex, newS, false, true);
    }

    return newS;
}

export function resetSyncPoints(api: alphaTab.AlphaTabApi, state: SyncPointInfo): SyncPointInfo {
    for (const b of api.score!.masterBars) {
        b.syncPoints = undefined;
    }

    return {
        ...state,
        syncPointMarkers: buildSyncPointMarkers(api)
    };
}

export function applySyncPoints(api: alphaTab.AlphaTabApi, syncPointInfo: SyncPointInfo) {
    const flatSyncPoints: alphaTab.model.FlatSyncPoint[] = toFlatSyncPoints(syncPointInfo);

    // remember and set again the tick position after sync point update
    // this will ensure the cursor and player seek accordingly with keeping the cursor
    // where it is currently shown on the notation.
    const tickPosition = api.tickPosition;
    api.score!.applyFlatSyncPoints(flatSyncPoints);
    api.updateSyncPoints();
    api.tickPosition = tickPosition;
}

function toFlatSyncPoints(syncPointInfo: SyncPointInfo) {
    const flatSyncPoints: alphaTab.model.FlatSyncPoint[] = [];
    for (const m of syncPointInfo.syncPointMarkers) {
        if (m.modifiedTempo) {
            flatSyncPoints.push({
                barIndex: m.masterBarIndex,
                barOccurence: m.occurence,
                barPosition: m.ratioPosition,
                millisecondOffset: m.syncTime | 0,
                modifiedTempo: m.modifiedTempo
            })
        }
    }
    return flatSyncPoints;
}

export function syncPointsToTypeScriptCode(info: SyncPointInfo, indent: string): string {
    const lines: string[] = [];

    const flat = toFlatSyncPoints(info);
    for (const m of flat) {
        lines.push(`${indent}${JSON.stringify(m)}`)
    }

    return lines.join(',\n');
}

export function syncPointsToCSharpCode(info: SyncPointInfo, indent: string): string {
    const lines: string[] = [];

    const flat = toFlatSyncPoints(info);
    for (const m of flat) {
        const parameters = Object.entries(m).map(m => `${m[0]}: ${m[1]}`).join(',');
        lines.push(`${indent}new(${parameters})`)
    }

    return lines.join(',\n');
}
export function syncPointsToKotlinCode(info: SyncPointInfo, indent: string): string {
    const lines: string[] = [];

    const flat = toFlatSyncPoints(info);
    for (const m of flat) {
        const parameters = Object.entries(m).map(m => `${m[0]} = ${m[1]}`).join(',');
        lines.push(`${indent}FlatSyncPoints(${parameters})`)
    }

    return lines.join(',\n');
}
