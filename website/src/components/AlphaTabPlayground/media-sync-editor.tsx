'use client';

import * as alphaTab from '@coderline/alphatab';
import type React from 'react';
import styles from './styles.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as solid from '@fortawesome/free-solid-svg-icons';
import * as brands from '@fortawesome/free-brands-svg-icons';
import { useCallback, useEffect, useRef, useState } from 'react';
import useResizeObserver from '@react-hook/resize-observer';
import { useAlphaTabEvent } from '@site/src/hooks';

export type MediaSyncEditorProps = {
    api: alphaTab.AlphaTabApi;
    score: alphaTab.model.Score;
};

type MasterBarMarker = {
    label: string;
    syncTime: number;

    synthTime: number;
    synthBpm: number;
    synthTickDuration: number;

    masterBarIndex: number;
    occurence: number;
    modifiedTempo?: number;

    isStartMarker: boolean;
    isEndMarker: boolean;
};

type SyncPointInfo = {
    endTick: number;
    endTime: number;
    sampleRate: number;
    leftSamples: Float32Array;
    rightSamples: Float32Array;
    masterBarMarkers: MasterBarMarker[];
};

// TODO: handle intermediate tempo changes and sync points

function ticksToMillis(tick: number, bpm: number): number {
    return (tick * 60000.0) / (bpm * 960);
}

async function buildSyncPointInfo(api: alphaTab.AlphaTabApi, createInitialSyncPoints: boolean): Promise<SyncPointInfo> {
    const tickCache = api.tickCache;
    if (!tickCache || !api.score?.backingTrack?.rawAudioFile) {
        return {
            endTick: 0,
            endTime: 0,
            sampleRate: 0,
            leftSamples: new Float32Array(0),
            rightSamples: new Float32Array(0),
            masterBarMarkers: []
        };
    }

    const audioContext = new AudioContext();
    const buffer = await audioContext.decodeAudioData(api.score!.backingTrack!.rawAudioFile.buffer.slice(0));
    const rawSamples: Float32Array[] =
        buffer.numberOfChannels === 1
            ? [buffer.getChannelData(0), buffer.getChannelData(0)]
            : [buffer.getChannelData(0), buffer.getChannelData(1)];

    const sampleRate = audioContext.sampleRate;
    const endTime = rawSamples[0].length / sampleRate;

    await audioContext.close();

    return {
        endTick: api.tickCache.masterBars.at(-1)!.end,
        masterBarMarkers: buildMasterBarMarkers(api, createInitialSyncPoints),
        sampleRate,
        leftSamples: rawSamples[0],
        rightSamples: rawSamples[1],
        endTime
    };
}
function buildMasterBarMarkers(api: alphaTab.AlphaTabApi, createInitialSyncPoints: boolean): MasterBarMarker[] {
    const markers: MasterBarMarker[] = [];

    if (createInitialSyncPoints) {
        // create initial sync points for all tempo changes to ensure the song and the
        // backing track roughly align
        let synthBpm = 0;
        let synthTimePosition = 0;
        let synthTickPosition = 0;

        const occurences = new Map<number, number>();
        for (const masterBar of api.tickCache!.masterBars) {
            const occurence = occurences.get(masterBar.masterBar.index) ?? 0;
            occurences.set(masterBar.masterBar.index, occurence + 1);

            for (const changes of masterBar.tempoChanges) {
                const absoluteTick = changes.tick;
                const tickOffset = absoluteTick - synthTickPosition;
                if (tickOffset > 0) {
                    const timeOffset = ticksToMillis(tickOffset, synthBpm);

                    synthTickPosition = absoluteTick;
                    synthTimePosition += timeOffset;
                }

                if (changes.tempo !== synthBpm && changes.tick === masterBar.start) {
                    const syncPoint = new alphaTab.model.Automation();
                    syncPoint.ratioPosition = 0;
                    syncPoint.type = alphaTab.model.AutomationType.SyncPoint;
                    syncPoint.syncPointValue = new alphaTab.model.SyncPointData();
                    syncPoint.syncPointValue.barOccurence = occurence;
                    syncPoint.syncPointValue.millisecondOffset = synthTimePosition;
                    syncPoint.syncPointValue.modifiedTempo = changes.tempo;
                    masterBar.masterBar.addSyncPoint(syncPoint);

                    synthBpm = changes.tempo;
                }
            }

            const tickOffset = masterBar.end - synthTickPosition;
            const timeOffset = ticksToMillis(tickOffset, synthBpm);
            synthTickPosition += tickOffset;
            synthTimePosition += timeOffset;
        }
    }

    const occurences = new Map<number, number>();
    let syncBpm = api.score!.tempo;
    let syncLastTick = 0;
    let syncLastMillisecondOffset = 0;

    let synthBpm = api.score!.tempo;
    let synthTimePosition = 0;
    let synthTickPosition = 0;

    for (const masterBar of api.tickCache!.masterBars) {
        const occurence = occurences.get(masterBar.masterBar.index) ?? 1;
        occurences.set(masterBar.masterBar.index, occurence + 1);

        const occurenceLabel = occurence > 1 ? ` (${occurence})` : '';
        const startSyncPoint = masterBar.masterBar.syncPoints?.find(m => m.ratioPosition === 0);

        let syncedStartTime: number;
        if (startSyncPoint) {
            syncedStartTime = startSyncPoint.syncPointValue!.millisecondOffset;
            syncBpm = startSyncPoint.syncPointValue!.modifiedTempo;
            syncLastMillisecondOffset = syncedStartTime;
            syncLastTick = masterBar.start;
        } else {
            const tickOffset = masterBar.start - syncLastTick;
            syncedStartTime = syncLastMillisecondOffset + ticksToMillis(tickOffset, syncBpm);
        }

        const isStartMarker = masterBar.masterBar.index === 0 && occurence === 1;
        const newMarker: MasterBarMarker = {
            label: isStartMarker ? 'Start' : `${masterBar.masterBar.index + 1}${occurenceLabel}`,
            masterBarIndex: masterBar.masterBar.index,
            synthTickDuration: masterBar.end - masterBar.start,
            occurence: occurence,
            syncTime: syncedStartTime / 1000,
            synthTime: synthTimePosition / 1000,
            synthBpm: masterBar.tempoChanges.length > 0 ? masterBar.tempoChanges[0].tempo : synthBpm,
            modifiedTempo: startSyncPoint?.syncPointValue?.modifiedTempo,
            isStartMarker,
            isEndMarker: false
        };
        markers.push(newMarker);

        for (const changes of masterBar.tempoChanges) {
            const absoluteTick = changes.tick;
            const tickOffset = absoluteTick - synthTickPosition;
            if (tickOffset > 0) {
                const timeOffset = ticksToMillis(tickOffset, synthBpm);

                synthTickPosition = absoluteTick;
                synthTimePosition += timeOffset;
            }

            synthBpm = changes.tempo;
        }

        const tickOffset = masterBar.end - synthTickPosition;
        const timeOffset = ticksToMillis(tickOffset, synthBpm);
        synthTickPosition += tickOffset;
        synthTimePosition += timeOffset;
    }

    const lastMasterBar = api.tickCache!.masterBars.at(-1)!;

    const endSyncPoint = lastMasterBar.masterBar.syncPoints?.find(m => m.ratioPosition === 1);

    const tickOffset = lastMasterBar.end - syncLastTick;
    const endSyncPointTime = endSyncPoint
        ? endSyncPoint.syncPointValue!.millisecondOffset
        : syncLastMillisecondOffset + ticksToMillis(tickOffset, syncBpm);

    markers.push({
        label: 'End',
        masterBarIndex: lastMasterBar.masterBar.index,
        synthTickDuration: 0,
        occurence: occurences.get(lastMasterBar.masterBar.index)!,
        syncTime: endSyncPointTime / 1000,
        synthTime: synthTimePosition / 1000,
        synthBpm,
        modifiedTempo: endSyncPoint?.syncPointValue?.modifiedTempo ?? synthBpm,
        isStartMarker: false,
        isEndMarker: true
    });

    return markers;
}

const pixelPerSeconds = 100;
const leftPadding = 15;
const barNumberHeight = 20;
const arrowHeight = 20;
const timeAxisHeight = 20;
const timeAxiSubSecondTickHeight = 5;
const barWidth = 1;
const timeAxisLineColor = '#A5A5A5';
const waveFormColor = '#436d9d99';
const font = '12px "Noto Sans"';
const dragLimit = 10;
const dragThreshold = 5;
const scrollThresholdPercent = 0.2;

function timePositionToX(timePosition: number, zoom: number): number {
    const zoomedPixelPerSecond = pixelPerSeconds * zoom;
    return timePosition * zoomedPixelPerSecond + leftPadding;
}

type MarkerDragInfo = {
    startX: number;
    startY: number;
    endX: number;
};

function computeMarkerInlineStyle(
    m: MasterBarMarker,
    zoom: number,
    draggingMarker: MasterBarMarker | null,
    draggingMarkerInfo: MarkerDragInfo | null
): React.CSSProperties {
    let left = timePositionToX(m.syncTime, zoom);

    if (m === draggingMarker && draggingMarkerInfo) {
        const deltaX = draggingMarkerInfo.endX - draggingMarkerInfo.startX;
        left += deltaX;
    }

    return {
        left: `${left}px`
    };
}

function updateSyncPointsAfterModification(modifiedIndex: number, s: SyncPointInfo, isDelete: boolean) {
    // find previous and next sync point (or start/end of the song)
    let startIndexForUpdate = Math.max(0, modifiedIndex - 1);
    while (startIndexForUpdate > 0 && !s.masterBarMarkers[startIndexForUpdate].modifiedTempo) {
        startIndexForUpdate--;
    }

    let nextIndexForUpdate = Math.min(s.masterBarMarkers.length - 1, modifiedIndex + 1);
    while (
        nextIndexForUpdate < s.masterBarMarkers.length - 1 &&
        !s.masterBarMarkers[nextIndexForUpdate].modifiedTempo
    ) {
        nextIndexForUpdate++;
    }

    const modifiedMarker = s.masterBarMarkers[modifiedIndex];

    // update from previous to current
    if (startIndexForUpdate < modifiedIndex) {
        const previousMarker = { ...s.masterBarMarkers[startIndexForUpdate] };
        s.masterBarMarkers[startIndexForUpdate] = previousMarker;
        const synthDuration = modifiedMarker.synthTime - previousMarker.synthTime;
        const syncedDuration = modifiedMarker.syncTime - previousMarker.syncTime;
        const newBpmBefore = (synthDuration / syncedDuration) * previousMarker.synthBpm;
        previousMarker.modifiedTempo = newBpmBefore;

        let syncedTimePosition = previousMarker.syncTime;
        for (let i = startIndexForUpdate; i < modifiedIndex; i++) {
            const marker = { ...s.masterBarMarkers[i] };
            s.masterBarMarkers[i] = marker;

            marker.syncTime = syncedTimePosition;
            syncedTimePosition += ticksToMillis(marker.synthTickDuration, newBpmBefore) / 1000;
        }
    }

    if (!isDelete) {
        const nextMarker = s.masterBarMarkers[nextIndexForUpdate];
        const synthDuration = nextMarker.synthTime - modifiedMarker.synthTime;
        const syncedDuration = nextMarker.syncTime - modifiedMarker.syncTime;
        const newBpmAfter = (synthDuration / syncedDuration) * modifiedMarker.synthBpm;
        modifiedMarker.modifiedTempo = newBpmAfter;

        let syncedTimePosition =
            modifiedMarker.syncTime + ticksToMillis(modifiedMarker.synthTickDuration, newBpmAfter) / 1000;
        for (let i = modifiedIndex + 1; i < nextIndexForUpdate; i++) {
            const marker = { ...s.masterBarMarkers[i] };
            s.masterBarMarkers[i] = marker;
            marker.syncTime = syncedTimePosition;

            syncedTimePosition += ticksToMillis(marker.synthTickDuration, newBpmAfter) / 1000;
        }
    }
}

type UndoStack = {
    undo: SyncPointInfo[];
    redo: SyncPointInfo[];
};

export const MediaSyncEditor: React.FC<MediaSyncEditorProps> = ({ api, score }) => {
    const markerCanvas = useRef<HTMLCanvasElement | null>(null);
    const waveFormCanvas = useRef<HTMLCanvasElement | null>(null);
    const syncArea = useRef<HTMLDivElement | null>(null);

    const [canvasSize, setCanvasSize] = useState([0, 0]);
    const [virtualWidth, setVirtualWidth] = useState(0);
    const [zoom, setZoom] = useState(1);

    const [syncPointInfo, setSyncPointInfo] = useState<SyncPointInfo>({
        endTick: 0,
        endTime: 0,
        sampleRate: 44100,
        leftSamples: new Float32Array(0),
        rightSamples: new Float32Array(0),
        masterBarMarkers: []
    });

    const [draggingMarker, setDraggingMarker] = useState<MasterBarMarker | null>(null);
    const [draggingMarkerInfo, setDraggingMarkerInfo] = useState<MarkerDragInfo | null>(null);
    const [undoStack, setUndoStack] = useState<UndoStack>({ undo: [], redo: [] });
    const [shouldStoreToUndo, setStoreToUndo] = useState(false);
    const [shouldApplySyncPoints, setApplySyncPoints] = useState(false);
    const [shouldCreateInitialSyncPoints, setCreateInitialSyncPoints] = useState(false);

    const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
    const [playbackTime, setPlaybackTime] = useState<number>(0);

    useEffect(() => {
        setAudioElement(
            (api.player!.output as alphaTab.synth.IAudioElementBackingTrackSynthOutput)?.audioElement ?? null
        );
    }, [api.player!.output]);

    useAlphaTabEvent(
        api,
        'midiLoad',
        () => {
            setAudioElement(
                (api.player!.output as alphaTab.synth.IAudioElementBackingTrackSynthOutput)?.audioElement ?? null
            );
            buildSyncPointInfo(api, shouldCreateInitialSyncPoints).then(x => setSyncPointInfo(x));
            setCreateInitialSyncPoints(false);
        },
        [shouldCreateInitialSyncPoints]
    );

    useEffect(() => {
        if (syncArea.current) {
            const xPos = timePositionToX(playbackTime, zoom);
            const canvasWidth = canvasSize[0];
            const threshold = canvasWidth * scrollThresholdPercent;
            const scrollOffset = syncArea.current.scrollLeft;

            // is out of screen?
            if (xPos < scrollOffset + threshold || (xPos - scrollOffset) > (canvasWidth - threshold)) {
                syncArea.current.scrollTo({
                    left: xPos - canvasWidth / 2,
                    behavior: 'smooth'
                });
            }
        }
    }, [api, playbackTime, canvasSize, syncArea]);

    useEffect(() => {
        const updateWaveFormCursor = () => {
            setPlaybackTime(audioElement!.currentTime);
        };

        let timeUpdate: number = 0;

        if (audioElement) {
            console.log('Audio element', audioElement);
            audioElement.addEventListener('timeupdate', updateWaveFormCursor);
            audioElement.addEventListener('durationchange', updateWaveFormCursor);
            audioElement.addEventListener('seeked', updateWaveFormCursor);
            timeUpdate = window.setInterval(() => {
                if (audioElement) {
                    setPlaybackTime(audioElement.currentTime);
                }
            }, 50);
            updateWaveFormCursor();
        }

        return () => {
            if (audioElement) {
                console.log('unregister Audio element', audioElement);
                audioElement.removeEventListener('timeupdate', updateWaveFormCursor);
                audioElement.removeEventListener('durationchange', updateWaveFormCursor);
                audioElement.removeEventListener('seeked', updateWaveFormCursor);
                window.clearInterval(timeUpdate);
            }
        };
    }, [audioElement]);

    useEffect(() => {
        if (!syncPointInfo) {
            return;
        }
        if (shouldStoreToUndo) {
            setUndoStack(s => ({
                undo: [...s.undo, syncPointInfo],
                redo: []
            }));
            setStoreToUndo(false);
        }

        const syncPointLookup = new Map<number, alphaTab.model.Automation[]>();
        for (const m of syncPointInfo.masterBarMarkers) {
            if (m.modifiedTempo) {
                let syncPoints = syncPointLookup.get(m.masterBarIndex);
                if (!syncPoints) {
                    syncPoints = [];
                    syncPointLookup.set(m.masterBarIndex, syncPoints);
                }

                const automation = new alphaTab.model.Automation();
                automation.ratioPosition = m.isEndMarker ? 1 : 0;
                automation.type = alphaTab.model.AutomationType.SyncPoint;
                automation.syncPointValue = new alphaTab.model.SyncPointData();
                automation.syncPointValue.modifiedTempo = m.modifiedTempo;
                automation.syncPointValue.millisecondOffset = m.syncTime * 1000;
                automation.syncPointValue.barOccurence = m.occurence - 1;
                syncPoints.push(automation);
            }
        }

        if (shouldApplySyncPoints) {
            console.log('Apply Sync points', syncPointLookup);

            // remember and set again the tick position after sync point update
            // this will ensure the cursor and player seek accordingly with keeping the cursor
            // where it is currently shown on the notation.
            const tickPosition = api.tickPosition;
            for (const masterBar of score.masterBars) {
                masterBar.syncPoints = syncPointLookup.get(masterBar.index);
            }
            api.updateSyncPoints();
            api.tickPosition = tickPosition;
            setApplySyncPoints(false);
        }
    }, [syncPointInfo]);

    const undo = () => {
        setUndoStack(s => {
            const newStack = { ...s };
            if (newStack.undo.length > 0) {
                const undoState = newStack.undo.pop()!;
                newStack.redo.push(undoState);
                setApplySyncPoints(true);
                setSyncPointInfo(newStack.undo.at(-1)!);
            }
            return newStack;
        });
    };

    const redo = () => {
        setUndoStack(s => {
            const newStack = { ...s };
            if (newStack.redo.length > 0) {
                const redoState = newStack.redo.pop()!;
                newStack.undo.push(redoState);
                setApplySyncPoints(true);
                setSyncPointInfo(redoState);
            }
            return newStack;
        });
    };

    const toggleMarker = (marker: MasterBarMarker, e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        setStoreToUndo(true);
        setApplySyncPoints(true);
        setSyncPointInfo(s => {
            if (!s) {
                return s;
            }

            // no removal of start and end marker
            if (marker.isStartMarker || marker.isEndMarker) {
                return s;
            }

            const markerIndex = s!.masterBarMarkers.indexOf(marker);
            if (markerIndex === -1) {
                return s;
            }

            const newS = { ...s, masterBarMarkers: [...s.masterBarMarkers] };
            if (marker.modifiedTempo) {
                newS.masterBarMarkers[markerIndex] = { ...marker, modifiedTempo: undefined };
                updateSyncPointsAfterModification(markerIndex, newS, true);
            } else {
                updateSyncPointsAfterModification(markerIndex, newS, false);
            }

            return newS;
        });
    };

    const mouseUpListener = useCallback(
        (e: MouseEvent) => {
            if (draggingMarker) {
                e.preventDefault();
                e.stopPropagation();

                const deltaX = draggingMarkerInfo!.endX - draggingMarkerInfo!.startX;
                if (deltaX > dragThreshold || draggingMarker.modifiedTempo !== undefined) {
                    setStoreToUndo(true);
                    setApplySyncPoints(true);
                    setSyncPointInfo(s => {
                        if (!s) {
                            return s;
                        }

                        const markerIndex = s.masterBarMarkers.findIndex(m => m === draggingMarker);

                        const zoomedPixelPerSecond = pixelPerSeconds * zoom;
                        const deltaTime = deltaX / zoomedPixelPerSecond;

                        const newTimePosition = draggingMarker.syncTime + deltaTime;

                        const newS = { ...s, masterBarMarkers: [...s.masterBarMarkers] };

                        // move the marker to the new position
                        newS.masterBarMarkers[markerIndex] = {
                            ...newS.masterBarMarkers[markerIndex],
                            syncTime: Math.max(0, newTimePosition)
                        };

                        updateSyncPointsAfterModification(markerIndex, newS, false);
                        return newS;
                    });
                    setDraggingMarker(null);
                    setDraggingMarkerInfo(null);
                }
            }
        },
        [draggingMarker, draggingMarkerInfo]
    );

    const mouseMoveListener = useCallback(
        (e: MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();

            setDraggingMarkerInfo(s => {
                if (!s || !syncPointInfo) {
                    return s;
                }

                const index = syncPointInfo.masterBarMarkers.indexOf(draggingMarker!);
                if (index === -1) {
                    return s;
                }

                let pageX = e.pageX;
                if (index < syncPointInfo.masterBarMarkers.length - 1) {
                    const deltaX = pageX - s.startX;
                    const thisX = timePositionToX(draggingMarker!.syncTime, zoom);
                    const newX = thisX + deltaX;

                    let nextMarkerIndex = index + 1;
                    while (
                        nextMarkerIndex < syncPointInfo.masterBarMarkers.length - 1 &&
                        !syncPointInfo.masterBarMarkers[nextMarkerIndex].modifiedTempo
                    ) {
                        nextMarkerIndex++;
                    }

                    const nextMarker = syncPointInfo.masterBarMarkers[nextMarkerIndex];
                    const nextX = timePositionToX(nextMarker.syncTime, zoom);
                    const maxX = nextX - dragLimit;

                    if (newX > maxX) {
                        pageX = s.startX + (maxX - thisX);
                    }
                }

                return { ...s, endX: pageX };
            });
        },
        [draggingMarker, syncPointInfo]
    );

    useEffect(() => {
        if (draggingMarker) {
            document.addEventListener('mouseup', mouseUpListener);
            document.addEventListener('mousemove', mouseMoveListener);
        }

        return () => {
            document.removeEventListener('mouseup', mouseUpListener);
            document.removeEventListener('mousemove', mouseMoveListener);
        };
    }, [draggingMarker, mouseUpListener, mouseMoveListener]);

    const startMarkerDrag = (marker: MasterBarMarker, e: React.MouseEvent) => {
        if (e.button !== 0 || marker.modifiedTempo === undefined) {
            return;
        }
        e.preventDefault();
        e.stopPropagation();
        setDraggingMarkerInfo(() => ({ startX: e.pageX, startY: e.pageY, endX: e.pageX }));
        setDraggingMarker(() => marker);
    };

    useEffect(() => {
        setUndoStack({
            undo: [],
            redo: []
        });
        setStoreToUndo(true);
        buildSyncPointInfo(api, shouldCreateInitialSyncPoints).then(x => setSyncPointInfo(x));
        setCreateInitialSyncPoints(false);
    }, [api]);

    const drawWaveform = () => {
        const can = waveFormCanvas.current;
        if (!syncPointInfo || !can) {
            return;
        }

        const ctx = can.getContext('2d')!;
        ctx.clearRect(0, 0, can.width, can.height);
        ctx.save();

        const waveFormY = barNumberHeight + arrowHeight;
        const halfHeight = ((can.height - waveFormY - timeAxisHeight) / 2) | 0;

        // frame
        ctx.fillStyle = timeAxisLineColor;
        ctx.fillRect(0, waveFormY + 2 * halfHeight, can.width, 1);
        ctx.fillRect(0, barNumberHeight, can.width, 1);
        ctx.fillRect(0, waveFormY, can.width, 1);
        ctx.fillRect(0, waveFormY + halfHeight, can.width, 1);

        // waveform
        ctx.translate(-syncArea.current!.scrollLeft, 0);

        ctx.beginPath();

        const startX = syncArea.current!.scrollLeft;
        const endX = startX + can.width;

        const zoomedPixelPerSecond = pixelPerSeconds * zoom;
        const samplesPerPixel = syncPointInfo.sampleRate / zoomedPixelPerSecond;

        for (let x = startX; x < endX; x += barWidth) {
            const startSample = (x * samplesPerPixel) | 0;
            const endSample = ((x + barWidth) * samplesPerPixel) | 0;

            let maxTop = 0;
            let maxBottom = 0;
            for (let sample = startSample; sample <= endSample; sample++) {
                // TODO: a logarithmic scale would be better here to scale 0-1 better as visible waveform
                // for now we multiply it for a good scale (unlikely we have a sound with 1 which is very loud)
                const visibilityFactor = 5;
                const magnitudeTop = Math.min(Math.abs(syncPointInfo.leftSamples[sample] * visibilityFactor || 0), 1);
                const magnitudeBottom = Math.min(Math.abs(syncPointInfo.rightSamples[sample] * visibilityFactor || 0), 1);
                if (magnitudeTop > maxTop) {
                    maxTop = magnitudeTop;
                }
                if (magnitudeBottom > maxBottom) {
                    maxBottom = magnitudeBottom;
                }
            }

            const topBarHeight = Math.round(maxTop * halfHeight);
            const bottomBarHeight = Math.round(maxBottom * halfHeight);
            const barHeight = topBarHeight + bottomBarHeight || 1;
            ctx.rect(x, waveFormY + (halfHeight - topBarHeight), barWidth, barHeight);
        }

        ctx.fillStyle = waveFormColor;
        ctx.fill();

        // time axis
        ctx.save();

        ctx.fillStyle = timeAxisLineColor;
        ctx.font = font;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'bottom';

        const timeAxisY = waveFormY + 2 * halfHeight;
        const leftTime = Math.floor((startX - leftPadding) / zoomedPixelPerSecond);
        const rightTime = Math.ceil(endX / zoomedPixelPerSecond);

        let time = leftTime;
        while (time <= rightTime) {
            const timeX = timePositionToX(time, zoom);
            ctx.fillRect(timeX, timeAxisY, 1, timeAxisHeight);

            const minutes = Math.floor(time / 60);
            const seconds = Math.floor(time - minutes * 60);

            const minutesText = minutes.toString().padStart(2, '0');
            const secondsText = seconds.toString().padStart(2, '0');

            ctx.fillText(`${minutesText}:${secondsText}`, timeX + 3, timeAxisY + timeAxisHeight);

            const nextSecond = time + 1;
            while (time < nextSecond) {
                const subSecondX = timePositionToX(time, zoom);
                ctx.fillRect(subSecondX, timeAxisY, 1, timeAxiSubSecondTickHeight);

                time += 0.1;
            }

            time = Math.floor(time + 0.5);
        }

        ctx.restore();
        ctx.restore();
    };

    useEffect(() => {
        drawWaveform();
    }, [canvasSize, virtualWidth]);

    useResizeObserver(syncArea, entry => {
        setCanvasSize(s => [entry.contentRect.width, entry.contentRect.height]);
    });

    useEffect(() => {
        if (syncPointInfo) {
            setVirtualWidth(s => pixelPerSeconds * syncPointInfo.endTime * zoom);
        }
        drawWaveform();
    }, [markerCanvas, syncPointInfo, zoom]);

    useEffect(() => {
        if (shouldCreateInitialSyncPoints) {
            // clear any potential sync points
            for (const m of score.masterBars) {
                m.syncPoints = undefined;
            }
            api.updateSettings();
            api.loadMidiForScore();
        }
    }, [shouldCreateInitialSyncPoints]);

    const onLoadAudioFile = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.mp3,.ogg,*.wav,*.flac,*.aac';
        input.onchange = () => {
            if (input.files?.length === 1) {
                const reader = new FileReader();
                reader.onload = e => {
                    // setup backing track
                    score.backingTrack = new alphaTab.model.BackingTrack();
                    score.backingTrack.rawAudioFile = new Uint8Array(e.target!.result as ArrayBuffer);

                    // create a fresh set of sync points upon load (start->end)
                    setCreateInitialSyncPoints(true);
                };
                reader.readAsArrayBuffer(input.files[0]);
            }
        };
        document.body.appendChild(input);
        input.click();
        document.body.removeChild(input);
    };

    return (
        <div className={styles['media-sync-editor']}>
            <div className={styles.toolbar}>
                <button
                    className="button button--secondary"
                    type="button"
                    data-tooltip-id="tooltip-playground"
                    onClick={() => {
                        onLoadAudioFile();
                    }}
                    data-tooltip-content="Load Audio File">
                    <FontAwesomeIcon icon={solid.faFileAudio} />
                </button>
                <button
                    className="button button--secondary"
                    type="button"
                    data-tooltip-id="tooltip-playground"
                    data-tooltip-content="Load Youtube Video">
                    <FontAwesomeIcon icon={brands.faYoutube} />
                </button>
                <div className={'dropdown dropdown--hoverable'}>
                    <button type="button" className={'button button--secondary'} data-toggle="dropdown">
                        <FontAwesomeIcon icon={solid.faMapPin} />
                    </button>
                    <ul className={'dropdown__menu'}>
                        <li>
                            <a className="dropdown__link" href="#reset-sync-points">
                                Reset Sync Points
                            </a>
                        </li>
                        <li>
                            <a className="dropdown__link" href="#crop-to-audio">
                                Automatic: Crop to Headable Audio
                            </a>
                        </li>
                        <li>
                            <a className="dropdown__link" href="#add-tempo-changes">
                                Automatic: Add Tempo Changes
                            </a>
                        </li>
                    </ul>
                </div>

                <button
                    className="button button--secondary"
                    type="button"
                    data-tooltip-id="tooltip-playground"
                    data-tooltip-content="Zoom Out"
                    onClick={() => {
                        setZoom(v => v / 1.2);
                    }}>
                    <FontAwesomeIcon icon={solid.faMagnifyingGlassMinus} />
                </button>

                <button
                    className="button button--secondary button--outline"
                    type="button"
                    onClick={() => {
                        setZoom(1);
                    }}>{`${(zoom * 100).toFixed(1)}%`}</button>

                <button
                    className="button button--secondary"
                    type="button"
                    data-tooltip-id="tooltip-playground"
                    data-tooltip-content="Zoom In"
                    onClick={() => {
                        setZoom(v => v * 1.2);
                    }}>
                    <FontAwesomeIcon icon={solid.faMagnifyingGlassPlus} />
                </button>

                <button
                    className="button button--secondary"
                    type="button"
                    data-tooltip-id="tooltip-playground"
                    data-tooltip-content="Undo"
                    disabled={undoStack.undo.length <= 1}
                    onClick={() => {
                        undo();
                    }}>
                    <FontAwesomeIcon icon={solid.faUndo} />
                </button>

                <button
                    className="button button--secondary"
                    type="button"
                    data-tooltip-id="tooltip-playground"
                    data-tooltip-content="Redo"
                    disabled={undoStack.redo.length === 0}
                    onClick={() => {
                        redo();
                    }}>
                    <FontAwesomeIcon icon={solid.faRedo} />
                </button>
            </div>
            <div className={styles['sync-area']} ref={syncArea} onScroll={() => drawWaveform()}>
                <div className={styles['sync-area-canvas-wrap']}>
                    <canvas ref={waveFormCanvas} width={canvasSize[0]} height={canvasSize[1]} />
                </div>
                <div
                    className={styles['sync-area-marker-wrap']}
                    style={{ width: `${virtualWidth}px`, height: `${canvasSize[1]}px` }}>
                    {syncPointInfo.masterBarMarkers.map(m => (
                        <div
                            key={m.label}
                            className={`${styles['masterbar-marker']}  ${m.modifiedTempo ? styles['has-sync-point'] : ''}`}
                            style={computeMarkerInlineStyle(m, zoom, draggingMarker, draggingMarkerInfo)}
                            data-tooltip-id="tooltip-playground"
                            data-tooltip-content={
                                m.modifiedTempo === undefined
                                    ? 'Double Click to add sync point'
                                    : 'Double Click to remove sync point'
                            }
                            onDoubleClick={e => toggleMarker(m, e)}
                            onMouseDown={e => {
                                startMarkerDrag(m, e);
                            }}>
                            <div className={styles['marker-label']}>{m.label}</div>
                            <div className={styles['marker-head']}>
                                <div className={`${styles['marker-arrow']}`} />
                                {!m.isEndMarker && m.modifiedTempo && (
                                    <div className={styles['marker-tempo']}>{m.modifiedTempo.toFixed(1)} bpm</div>
                                )}
                            </div>
                            <div className={styles['marker-line']} />
                        </div>
                    ))}
                </div>
                <div
                    className={styles['sync-area-playback-cursor']}
                    style={{ transform: `translateX(${timePositionToX(playbackTime, zoom)}px)` }}
                />
            </div>
        </div>
    );
};
