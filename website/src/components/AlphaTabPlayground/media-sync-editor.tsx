'use client';

import * as alphaTab from '@coderline/alphatab';
import type React from 'react';
import styles from './styles.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as solid from '@fortawesome/free-solid-svg-icons';
import * as brands from '@fortawesome/free-brands-svg-icons';
import { useEffect, useRef, useState } from 'react';
import useResizeObserver from '@react-hook/resize-observer';
import { useAlphaTabEvent } from '@site/src/hooks';
import {
    applySyncPoints,
    buildSyncPointInfoFromApi,
    autoSync,
    resetSyncPoints,
    type SyncPointInfo
} from './sync-point-info';
import { WaveformCanvas } from './waveform-canvas';
import { SyncPointMarkerPanel } from './sync-point-marker-panel';
import { timePositionToX, useSyncPointInfoUndo } from './helpers';

// General Settings for the UI
const pixelPerMilliseconds = 100 / 1000;
const leftPadding = 15;
const scrollThresholdPercent = 0.2;

export type MediaSyncEditorProps = {
    api: alphaTab.AlphaTabApi;
    score: alphaTab.model.Score;
};

const useAudioElementPlaybackTime = (api: alphaTab.AlphaTabApi) => {
    const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

    const [playbackTime, setPlaybackTime] = useState<number>(0);

    useEffect(() => {
        setAudioElement(
            (api.player!.output as alphaTab.synth.IAudioElementBackingTrackSynthOutput)?.audioElement ?? null
        );
    }, [api.player!.output]);

    useAlphaTabEvent(api, 'midiLoad', () => {
        setAudioElement(
            (api.player!.output as alphaTab.synth.IAudioElementBackingTrackSynthOutput)?.audioElement ?? null
        );
    });

    useEffect(() => {
        const updateWaveFormCursor = () => {
            if (audioElement) {
                setPlaybackTime(audioElement.currentTime * 1000);
            }
        };

        let timeUpdate: number = 0;

        if (audioElement) {
            audioElement.addEventListener('timeupdate', updateWaveFormCursor);
            audioElement.addEventListener('durationchange', updateWaveFormCursor);
            audioElement.addEventListener('seeked', updateWaveFormCursor);
            timeUpdate = window.setInterval(() => {
                if (audioElement) {
                    setPlaybackTime(audioElement.currentTime * 1000);
                }
            }, 50);
            updateWaveFormCursor();
        }

        return () => {
            if (audioElement) {
                audioElement.removeEventListener('timeupdate', updateWaveFormCursor);
                audioElement.removeEventListener('durationchange', updateWaveFormCursor);
                audioElement.removeEventListener('seeked', updateWaveFormCursor);
                window.clearInterval(timeUpdate);
            }
        };
    }, [audioElement]);

    return playbackTime;
};

export const MediaSyncEditor: React.FC<MediaSyncEditorProps> = ({ api, score }) => {
    const syncArea = useRef<HTMLDivElement | null>(null);

    const [canvasSize, setCanvasSize] = useState([0, 0]);
    const [virtualWidth, setVirtualWidth] = useState(0);
    const [zoom, setZoom] = useState(1);
    const [scrolOffset, setScrollOffset] = useState(0);

    const [syncPointInfo, setSyncPointInfo] = useState<SyncPointInfo>({
        endTick: 0,
        endTime: 0,
        sampleRate: 44100,
        leftSamples: new Float32Array(0),
        rightSamples: new Float32Array(0),
        syncPointMarkers: []
    });

    const shouldStoreToUndo = useRef(false);
    const shouldApplySyncPoints = useRef(false);
    const shouldCreateInitialSyncPoints = useRef(false);

    const undo = useSyncPointInfoUndo();
    const playbackTime = useAudioElementPlaybackTime(api);

    // Sync Point Info building and update

    const initFromApi = () => {
        undo.resetUndo();
        shouldStoreToUndo.current = true;
        buildSyncPointInfoFromApi(api, shouldCreateInitialSyncPoints.current).then(x => setSyncPointInfo(x));
        shouldCreateInitialSyncPoints.current = false;
    };

    useAlphaTabEvent(
        api,
        'midiLoad',
        () => {
            initFromApi();
        },
        [shouldCreateInitialSyncPoints]
    );

    useEffect(() => {
        initFromApi();
    }, [api]);

    useEffect(() => {
        // store to undo if needed
        if (shouldStoreToUndo.current) {
            undo.storeUndo(syncPointInfo);
            shouldStoreToUndo.current = false;
        }

        // apply if needed
        if (shouldApplySyncPoints) {
            applySyncPoints(api, syncPointInfo);
            shouldApplySyncPoints.current = false;
        }
    }, [syncPointInfo]);

    // cursor handling
    useEffect(() => {
        if (syncArea.current) {
            const xPos = timePositionToX(pixelPerMilliseconds, playbackTime, zoom, leftPadding);
            const canvasWidth = canvasSize[0];
            const threshold = canvasWidth * scrollThresholdPercent;
            const scrollOffset = syncArea.current.scrollLeft;

            // is out of screen?
            if (xPos < scrollOffset + threshold || xPos - scrollOffset > canvasWidth - threshold) {
                syncArea.current.scrollTo({
                    left: xPos - canvasWidth / 2,
                    behavior: 'smooth'
                });
            }
        }
    }, [playbackTime, canvasSize, syncArea]);

    // UI parts
    useResizeObserver(syncArea, entry => {
        setCanvasSize([entry.contentRect.width, entry.contentRect.height]);
    });

    useEffect(() => {
        if (syncPointInfo) {
            setVirtualWidth(s => pixelPerMilliseconds * syncPointInfo.endTime * zoom);
        }
    }, [syncPointInfo, zoom]);

    const onLoadAudioFile = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.mp3,.ogg,*.wav,*.flac,*.aac,*.mp4,*.mkv,*.avi,*.webm';
        input.onchange = () => {
            if (input.files?.length === 1) {
                const reader = new FileReader();
                reader.onload = e => {
                    // setup backing track
                    score.backingTrack = new alphaTab.model.BackingTrack();
                    score.backingTrack.rawAudioFile = new Uint8Array(e.target!.result as ArrayBuffer);

                    // create a fresh set of sync points upon load (start->end)
                    shouldApplySyncPoints.current = true;
                    shouldCreateInitialSyncPoints.current = true;

                    // clear any potential sync points
                    for (const m of score.masterBars) {
                        m.syncPoints = undefined;
                    }
                    api.updateSettings();
                    api.loadMidiForScore(); // will fire the initialization above once ready.
                };
                reader.readAsArrayBuffer(input.files[0]);
            }
        };
        document.body.appendChild(input);
        input.click();
        document.body.removeChild(input);
    };

    const onResetSyncPoints = () => {
        shouldApplySyncPoints.current = true;
        shouldStoreToUndo.current = true;
        setSyncPointInfo(s => {
            return s ? resetSyncPoints(api, s) : s;
        });
    };

    const onAutoSync = () => {
        shouldApplySyncPoints.current = true;
        shouldStoreToUndo.current = true;
        setSyncPointInfo(s => {
            return s ? autoSync(s, api) : s;
        });
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
                            <a
                                className="dropdown__link"
                                href="#reset-sync-points"
                                onClick={e => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onResetSyncPoints();
                                }}>
                                Reset Sync Points
                            </a>
                        </li>
                        <li>
                            <a
                                className="dropdown__link"
                                href="#crop-to-audio"
                                onClick={e => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onAutoSync();
                                }}>
                                Automatic Sync with Tempo Changes and Audio
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
                    disabled={!undo.canUndo}
                    onClick={() => {
                        undo.undo(i => {
                            shouldApplySyncPoints.current = true;
                            setSyncPointInfo(i);
                        });
                    }}>
                    <FontAwesomeIcon icon={solid.faUndo} />
                </button>

                <button
                    className="button button--secondary"
                    type="button"
                    data-tooltip-id="tooltip-playground"
                    data-tooltip-content="Redo"
                    disabled={!undo.canRedo}
                    onClick={() => {
                        undo.redo(i => {
                            shouldApplySyncPoints.current = true;
                            setSyncPointInfo(i);
                        });
                    }}>
                    <FontAwesomeIcon icon={solid.faRedo} />
                </button>
            </div>
            <div
                className={styles['sync-area']}
                ref={syncArea}
                onScroll={e => setScrollOffset((e.target as HTMLDivElement).scrollLeft)}>
                <div className={styles['sync-area-canvas-wrap']}>
                    <WaveformCanvas
                        leftPadding={leftPadding}
                        leftSamples={syncPointInfo.leftSamples}
                        rightSamples={syncPointInfo.rightSamples}
                        sampleRate={syncPointInfo.sampleRate}
                        pixelPerMilliseconds={pixelPerMilliseconds}
                        scrollOffset={scrolOffset}
                        zoom={zoom}
                        width={canvasSize[0]}
                        height={canvasSize[1]}
                    />
                </div>
                <SyncPointMarkerPanel
                    width={virtualWidth}
                    height={canvasSize[1]}
                    syncPointInfo={syncPointInfo}
                    leftPadding={leftPadding}
                    pixelPerMilliseconds={pixelPerMilliseconds}
                    zoom={zoom}
                    onSyncPointInfoChanged={newInfo => {
                        shouldApplySyncPoints.current = true;
                        shouldStoreToUndo.current = true;
                        setSyncPointInfo(newInfo);
                    }}
                />
                <div
                    className={styles['sync-area-playback-cursor']}
                    style={{
                        transform: `translateX(${timePositionToX(
                            pixelPerMilliseconds,

                            playbackTime,
                            zoom,
                            leftPadding
                        )}px)`
                    }}
                />
            </div>
        </div>
    );
};
