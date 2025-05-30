import * as alphaTab from '@coderline/alphatab';
import type { HTMLMediaElementLike } from './helpers';

export enum SyncPointMarkerType {
    StartMarker = 0,
    EndMarker = 1,
    MasterBar = 2,
    Intermediate = 3
}

const uid = () =>
    String(
        Date.now().toString(32) +
        Math.random().toString(16)
    ).replace(/\./g, '')


export type SyncPointMarker = {
    uniqueId: string;

    syncTime: number;

    synthTime: number;
    synthBpm: number;
    synthTick: number;

    masterBarIndex: number;
    masterBarStart: number;
    masterBarEnd: number;
    occurence: number;
    syncBpm?: number;

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

    // phase 1: generate actual sync points all details set like tempos and times
    const syncPointsWithTime = alphaTab.midi.MidiFileGenerator.generateSyncPoints(api.score!);

    // phase 2: create markers and placeholder markers for the sync points
    let nextSyncPointIndex = 0;

    let synthBpm = api.score!.tempo;
    let syncBpm = synthBpm;
    let synthTick = 0;
    let synthTime = 0;
    let syncTime = 0;

    for (let i = 0; i < api.tickCache!.masterBars.length; i++) {
        const masterBar = api.tickCache!.masterBars[i];
        const occurence = occurences.get(masterBar.masterBar.index) ?? 0;
        occurences.set(masterBar.masterBar.index, occurence + 1);

        // walk through time axis of bar and either generate or take the existing sync points
        const duration = masterBar.end - masterBar.start;
        const timeSignatureSteps = duration / masterBar.masterBar.timeSignatureNumerator;
        let barTick = masterBar.start;

        let tempoChangeIndex = 0;

        while (barTick <= masterBar.end) {

            let hasMarkerAtTick = false;

            // add all markers which are explicitly set until here
            while (nextSyncPointIndex < syncPointsWithTime.length &&
                syncPointsWithTime[nextSyncPointIndex].synthTick <= barTick &&
                syncPointsWithTime[nextSyncPointIndex].masterBarIndex === masterBar.masterBar.index &&
                syncPointsWithTime[nextSyncPointIndex].masterBarOccurence === occurence
            ) {

                const syncPoint = syncPointsWithTime[nextSyncPointIndex];

                const newMarker: SyncPointMarker = {
                    uniqueId: uid(),
                    masterBarIndex: masterBar.masterBar.index,
                    masterBarStart: masterBar.start,
                    masterBarEnd: masterBar.end,
                    occurence: occurence,

                    synthTick: syncPoint.synthTick,
                    syncTime: syncPoint.syncTime,
                    synthTime: syncPoint.synthTime,
                    synthBpm: syncPoint.synthBpm,
                    syncBpm: syncPoint.syncBpm,

                    markerType: syncPoint.synthTick === masterBar.start
                        ? SyncPointMarkerType.MasterBar
                        : SyncPointMarkerType.Intermediate,
                };
                markers.push(newMarker);

                if (syncPoint.synthTick === barTick) {
                    hasMarkerAtTick = true;
                }

                synthBpm = syncPoint.synthBpm;
                syncBpm = syncPoint.syncBpm;
                synthTime = syncPoint.synthTime;
                syncTime = syncPoint.syncTime;
                synthTick = syncPoint.synthTick;

                nextSyncPointIndex++;
            }

            // process any potential tempo changes between sync point and current time
            while (tempoChangeIndex < masterBar.tempoChanges.length &&
                masterBar.tempoChanges[tempoChangeIndex].tick < barTick) {
                const tickDiff = masterBar.tempoChanges[tempoChangeIndex].tick - synthTick;
                if (tickDiff > 0) {
                    synthTime += ticksToMilliseconds(tickDiff, synthBpm);
                    syncTime += ticksToMilliseconds(tickDiff, syncBpm);
                }
                synthTick += tickDiff;
                tempoChangeIndex++;
            }

            // process remaining ticks until marker
            const tickDiff = barTick - synthTick;
            if (tickDiff > 0) {
                synthTime += ticksToMilliseconds(tickDiff, synthBpm);
                syncTime += ticksToMilliseconds(tickDiff, syncBpm);
            }
            synthTick = barTick;


            if (!hasMarkerAtTick && barTick < masterBar.end) {
                const newMarker: SyncPointMarker = {
                    uniqueId: uid(),
                    masterBarIndex: masterBar.masterBar.index,
                    masterBarStart: masterBar.start,
                    masterBarEnd: masterBar.end,
                    occurence: occurence,

                    synthTick: barTick,
                    syncTime: syncTime,
                    synthTime: synthTime,
                    synthBpm: synthBpm,

                    markerType: barTick === masterBar.start
                        ? SyncPointMarkerType.MasterBar
                        : SyncPointMarkerType.Intermediate,
                };
                markers.push(newMarker);
            }

            barTick += timeSignatureSteps;
        }
    }

    // at the very end we create the end marker
    const lastMasterBar = api.tickCache!.masterBars.at(-1)!;
    const lastSyncPoint = markers.at(-1)!;
    if (lastMasterBar.end > lastSyncPoint.synthTick) {
        // process remaining ticks until end
        const tickDiff = lastMasterBar.end - synthTick;
        if (tickDiff > 0) {
            synthTime += ticksToMilliseconds(tickDiff, synthBpm);
            syncTime += ticksToMilliseconds(tickDiff, syncBpm);
        }
        synthTick = lastMasterBar.end;

        markers.push({
            uniqueId: uid(),
            masterBarIndex: lastMasterBar.masterBar.index,
            masterBarStart: lastMasterBar.start,
            masterBarEnd: lastMasterBar.end,
            occurence: occurences.get(lastMasterBar.masterBar.index)! - 1,

            synthTick: synthTick,
            syncTime: syncTime,
            synthTime: synthTime,
            synthBpm: synthBpm,

            markerType: SyncPointMarkerType.EndMarker,
        });
    } else {
        lastSyncPoint.markerType = SyncPointMarkerType.EndMarker;
    }

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
    
    state.syncPointMarkers = buildSyncPointMarkers(api);

    // with the final durations known, we can "squeeze" together the song
    // from start and end (keeping the relative positions)
    // and the other bars will be adjusted accordingly
    if (padToAudio) {
        const [songStart, songEnd] = findAudioStartAndEnd(state);

        const synthDuration = state.syncPointMarkers.at(-1)!.synthTime;
        const realDuration = songEnd - songStart;
        const scaleFactor = realDuration / synthDuration;
        
        state.syncPointMarkers.at(0)!.syncBpm = state.syncPointMarkers.at(0)!.synthBpm;
        state.syncPointMarkers.at(-1)!.syncBpm = state.syncPointMarkers.at(-1)!.synthBpm;

        // 1st Pass: shift all tempo change markers relatively and calculate BPM
        const syncPoints = state.syncPointMarkers.filter(m => m.syncBpm !== undefined);
        let syncTime = songStart;
        for (let i = 0; i < syncPoints.length; i++) {
            const syncPoint = syncPoints[i];

            syncPoint.syncTime = syncTime;

            if (i > 0) {
                const previousMarker = syncPoints[i - 1];
                const synthDuration = syncPoint.synthTime - previousMarker.synthTime;
                const syncedDuration = syncPoint.syncTime - previousMarker.syncTime;
                const newBpm = (synthDuration / syncedDuration) * previousMarker.synthBpm;
                previousMarker.syncBpm = newBpm;
            }

            const ownStart = syncPoint.synthTime;
            const nextStart = i < syncPoints.length - 1 ? syncPoints[i + 1].synthTime : ownStart;

            const oldDuration = nextStart - ownStart;
            const newDuration = oldDuration * scaleFactor;

            syncTime += newDuration;
        }

        // 2nd Pass: adjust all in-between markers according to the new position
        syncTime = songStart;
        let syncedBpm = syncPoints[0].syncBpm!;
        for (let i = 0; i < state.syncPointMarkers.length; i++) {
            const marker = state.syncPointMarkers[i];
            marker.syncTime = syncTime;

            if (marker.syncBpm) {
                syncedBpm = marker.syncBpm;
            }

            if (i < state.syncPointMarkers.length - 1) {
                const tickDiff = state.syncPointMarkers[i + 1].synthTick - marker.synthTick;
                syncTime += ticksToMilliseconds(tickDiff, syncedBpm);
            }
        }
    }

    return state;
}

function updateModifiedTempo(
    syncPoint: SyncPointMarker,
    nextSyncPointSynthTime: number, nextSyncPointSyncTime: number
) {
    const synthDuration = nextSyncPointSynthTime - syncPoint.synthTime;
    const syncedDuration = nextSyncPointSyncTime - syncPoint.syncTime;
    const modifiedTempo = (synthDuration / syncedDuration) * syncPoint.synthBpm;
    syncPoint.syncBpm = modifiedTempo;
}

export function updateSyncPointsAfterModification(
    modifiedIndex: number,
    s: SyncPointInfo,
    isDelete: boolean,
    cloneMarkers: boolean
) {
    // find previous and next sync point (or start/end of the song)
    let startIndexForUpdate = Math.max(0, modifiedIndex - 1);
    while (startIndexForUpdate > 0 && !s.syncPointMarkers[startIndexForUpdate].syncBpm) {
        startIndexForUpdate--;
    }

    let nextIndexForUpdate = Math.min(s.syncPointMarkers.length - 1, modifiedIndex + 1);
    while (
        nextIndexForUpdate < s.syncPointMarkers.length - 1 &&
        !s.syncPointMarkers[nextIndexForUpdate].syncBpm
    ) {
        nextIndexForUpdate++;
    }

    const modifiedMarker = s.syncPointMarkers[modifiedIndex];
    let newBpmBefore = modifiedMarker.synthBpm;

    if (isDelete) {
        // delete update: we reposition all markers between the previous and next fixed markers

        if (nextIndexForUpdate > modifiedIndex) {

            // calculate BPM between previous and next sync point after the deletion of this one
            const previousMarker = cloneMarkers
                ? { ...s.syncPointMarkers[startIndexForUpdate] }
                : s.syncPointMarkers[startIndexForUpdate];
            s.syncPointMarkers[startIndexForUpdate] = previousMarker;

            const nextMarker = s.syncPointMarkers[nextIndexForUpdate];
            if (nextMarker.syncBpm) {
                const synthDuration = nextMarker.synthTime - previousMarker.synthTime;
                const syncedDuration = nextMarker.syncTime - previousMarker.syncTime;
                newBpmBefore = (synthDuration / syncedDuration) * previousMarker.synthBpm;
            } else {
                nextIndexForUpdate++;
            }

            previousMarker.syncBpm = newBpmBefore;
            // apply BPM and position to whole range between the other markers
            for (let i = startIndexForUpdate + 1; i < nextIndexForUpdate; i++) {
                const newMarker = cloneMarkers
                    ? { ...s.syncPointMarkers[i] }
                    : s.syncPointMarkers[i];
                s.syncPointMarkers[i] = newMarker;
                const tickDuration = newMarker.synthTick - previousMarker.synthTick;
                newMarker.syncTime = previousMarker.syncTime + ticksToMilliseconds(tickDuration, newBpmBefore);
            }
        }
        else {
            // should never happen, this would mean a deletion of the last sync point which we prevent at other places
            console.warn('Attempted deletion of last sync point which should not be possible');
            return;
        }
    } else {
        // move update: we have to adjust the markers before and after the moved marker according to the right BPMs

        // update from previous to current (modified)

        if (startIndexForUpdate < modifiedIndex) {
            const previousMarker = cloneMarkers
                ? { ...s.syncPointMarkers[startIndexForUpdate] }
                : s.syncPointMarkers[startIndexForUpdate];
            s.syncPointMarkers[startIndexForUpdate] = previousMarker;
            const synthDuration = modifiedMarker.synthTime - previousMarker.synthTime;
            const syncedDuration = modifiedMarker.syncTime - previousMarker.syncTime;
            newBpmBefore = (synthDuration / syncedDuration) * previousMarker.synthBpm;
            previousMarker.syncBpm = newBpmBefore;

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

        // update from current (modified) to next
        if (nextIndexForUpdate > modifiedIndex) {
            const nextMarker = s.syncPointMarkers[nextIndexForUpdate];
            let newBpmAfter: number;
            if (nextMarker.syncBpm) {
                const synthDuration = nextMarker.synthTime - modifiedMarker.synthTime;
                const syncedDuration = nextMarker.syncTime - modifiedMarker.syncTime;
                newBpmAfter = syncedDuration > 0 ? (synthDuration / syncedDuration) * modifiedMarker.synthBpm : 0;
            } else {
                newBpmAfter = newBpmBefore;
                nextIndexForUpdate++;
            }

            modifiedMarker.syncBpm = newBpmAfter;
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
    if (marker.syncBpm) {
        newS.syncPointMarkers[markerIndex] = { ...marker, syncBpm: undefined };

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
    console.log('apply', flatSyncPoints);

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
        if (m.syncBpm) {
            const duration = m.masterBarEnd - m.masterBarStart;
            const ratioPosition = (m.synthTick - m.masterBarStart) / duration;
            flatSyncPoints.push({
                barIndex: m.masterBarIndex,
                barOccurence: m.occurence,
                barPosition: ratioPosition,
                millisecondOffset: m.syncTime | 0
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

export function syncPointsToAlphaTex(info: SyncPointInfo): string {
    const lines: string[] = [];

    const flat = toFlatSyncPoints(info);
    for (const m of flat) {
        const barPosition = m.barPosition > 0 ? ` ${Number(m.barPosition.toFixed(3))}` : '';
        lines.push(`\\sync ${m.barIndex} ${m.barOccurence} ${m.millisecondOffset}${barPosition}`)
    }

    return lines.join('\n');
}
