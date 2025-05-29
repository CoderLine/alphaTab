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
import {
    applySyncPoints,
    buildSyncPointInfoFromAudio,
    autoSync,
    resetSyncPoints,
    type SyncPointInfo,
    buildSyncPointInfoFromYoutube,
    buildSyncPointInfoFromSynth,
    syncPointsToTypeScriptCode,
    syncPointsToCSharpCode,
    syncPointsToKotlinCode
} from './sync-point-info';
import { WaveformCanvas } from './waveform-canvas';
import { SyncPointMarkerPanel } from './sync-point-marker-panel';
import {
    extractYouTubeVideoId,
    type HTMLMediaElementLike,
    MediaType,
    type MediaTypeState,
    timePositionToX,
    useSyncPointInfoUndo
} from './helpers';
import { downloadFile } from '@site/src/utils';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';

// General Settings for the UI
const pixelPerMilliseconds = 100 / 1000;
const leftPadding = 15;
const scrollThresholdPercent = 0.2;

const useMediaElementPlaybackTime = (
    api: alphaTab.AlphaTabApi,
    youtubePlayer: HTMLMediaElementLike | undefined
): [number, React.Dispatch<React.SetStateAction<number>>] => {
    const [mediaElement, setMediaElement] = useState<HTMLMediaElementLike | null>(null);

    const [playbackTime, setPlaybackTime] = useState<number>(0);

    const updateMediaElement = () => {
        switch (api.actualPlayerMode) {
            case alphaTab.PlayerMode.EnabledBackingTrack:
                setMediaElement(
                    (api.player!.output as alphaTab.synth.IAudioElementBackingTrackSynthOutput)?.audioElement ?? null
                );
                break;
            case alphaTab.PlayerMode.EnabledExternalMedia:
                setMediaElement(youtubePlayer ?? null);
                break;
            default:
                setMediaElement(null);
        }
    };

    useEffect(() => {}, [youtubePlayer]);

    useEffect(() => {
        updateMediaElement();
    }, [api.player!.output]);

    useEffect(() => {
        updateMediaElement();
    }, [youtubePlayer]);

    useAlphaTabEvent(api, 'midiLoad', () => {
        updateMediaElement();
    });

    useEffect(() => {
        const updateWaveFormCursor = () => {
            if (mediaElement) {
                setPlaybackTime(mediaElement.currentTime * 1000);
            }
        };

        let timeUpdate: number = 0;

        if (mediaElement) {
            mediaElement.addEventListener('timeupdate', updateWaveFormCursor);
            mediaElement.addEventListener('durationchange', updateWaveFormCursor);
            mediaElement.addEventListener('seeked', updateWaveFormCursor);
            timeUpdate = window.setInterval(() => {
                if (mediaElement) {
                    setPlaybackTime(mediaElement.currentTime * 1000);
                }
            }, 50);
            updateWaveFormCursor();
        }

        return () => {
            if (mediaElement) {
                mediaElement.removeEventListener('timeupdate', updateWaveFormCursor);
                mediaElement.removeEventListener('durationchange', updateWaveFormCursor);
                mediaElement.removeEventListener('seeked', updateWaveFormCursor);
                window.clearInterval(timeUpdate);
            }
        };
    }, [mediaElement]);

    return [
        playbackTime,
        (playbackTime: number) => {
            if (mediaElement) {
                mediaElement.currentTime = playbackTime / 1000;
            }
        }
    ];
};

export type MediaSyncEditorProps = {
    api: alphaTab.AlphaTabApi;
    score: alphaTab.model.Score;
    youtubePlayer?: HTMLMediaElementLike;
    mediaType: MediaTypeState;
    onMediaTypeChange(newMediaType: MediaTypeState): void;
};

export const MediaSyncEditor: React.FC<MediaSyncEditorProps> = ({
    api,
    score,
    youtubePlayer,
    mediaType,
    onMediaTypeChange
}) => {
    const syncArea = useRef<HTMLDivElement | null>(null);

    const [canvasSize, setCanvasSize] = useState([0, 0]);
    const [virtualWidth, setVirtualWidth] = useState(0);
    const [zoom, setZoom] = useState(1);
    const [scrolOffset, setScrollOffset] = useState(0);
    const [newYoutubeUrl, setNewYoutubeUrl] = useState<string>('');

    const [syncPointInfo, setSyncPointInfo] = useState<SyncPointInfo>({
        endTick: 0,
        endTime: 0,
        sampleRate: 44100,
        leftSamples: new Float32Array(0),
        rightSamples: new Float32Array(0),
        syncPointMarkers: []
    });

    const shouldStoreToUndo = useRef(false);

    const undo = useSyncPointInfoUndo();
    const [playbackTime, setPlaybackTime] = useMediaElementPlaybackTime(api, youtubePlayer);

    // Sync Point Info building and update

    const initFromApi = useCallback(() => {
        undo.resetUndo();
        shouldStoreToUndo.current = true;
        switch (mediaType.type) {
            case MediaType.Synth:
                const synthInfo = buildSyncPointInfoFromSynth(api);
                if (synthInfo) {
                    setSyncPointInfo(synthInfo);
                }
                break;
            case MediaType.Audio:
                buildSyncPointInfoFromAudio(api).then(x => {
                    if (x) {
                        setSyncPointInfo(x);
                    }
                });
                break;
            case MediaType.YouTube:
                const youtubeInfo = buildSyncPointInfoFromYoutube(api, youtubePlayer);
                if (youtubeInfo) {
                    setSyncPointInfo(youtubeInfo);
                }
                break;
        }
    }, [api, youtubePlayer, mediaType]);

    useAlphaTabEvent(
        api,
        'midiLoad',
        () => {
            initFromApi();
        },
        []
    );

    useEffect(() => {
        initFromApi();
    }, [api, youtubePlayer, mediaType]);

    useEffect(() => {
        // store to undo if needed
        if (shouldStoreToUndo.current) {
            undo.storeUndo(syncPointInfo);
            shouldStoreToUndo.current = false;
        }

        applySyncPoints(api, syncPointInfo);
    }, [syncPointInfo]);

    // cursor handling
    const lastScroll = useRef(0);
    useEffect(() => {
        if (syncArea.current && (lastScroll.current === 0 || performance.now() - lastScroll.current > 500)) {
            const xPos = timePositionToX(pixelPerMilliseconds, playbackTime, zoom, leftPadding);
            const canvasWidth = canvasSize[0];
            const threshold = canvasWidth * scrollThresholdPercent;
            const scrollOffset = syncArea.current.scrollLeft;
            lastScroll.current = performance.now();

            // is out of screen?
            if (xPos < scrollOffset + threshold || xPos - scrollOffset > canvasWidth - threshold) {
                syncArea.current.scrollTo({
                    left: xPos - canvasWidth / 2,
                    behavior: 'smooth'
                });
            }
        }
    }, [playbackTime, canvasSize, syncArea]);

    const [isYoutubeModalOpen, setYoutubeModalOpen] = useState(false);
    const [isGenerateCodeModalOpen, setGenerateCodeModalOpen] = useState(false);
    const onLoadYouTube = () => {
        setNewYoutubeUrl(mediaType.youtubeUrl ?? '');
        setYoutubeModalOpen(true);
    };

    const newYoutubeUrlError = extractYouTubeVideoId(newYoutubeUrl) ? '' : 'Invalid YouTube URL or video ID';

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

                    onMediaTypeChange({
                        type: MediaType.Audio,
                        audioFile: score.backingTrack.rawAudioFile
                    });
                };
                reader.readAsArrayBuffer(input.files[0]);
            }
        };
        document.body.appendChild(input);
        input.click();
        document.body.removeChild(input);
    };

    const onLoadYouTubeVideo = (url: string) => {
        onMediaTypeChange({
            type: MediaType.YouTube,
            youtubeUrl: newYoutubeUrl
        });
    };

    const onLoadSynthesizer = () => {
        onMediaTypeChange({
            type: MediaType.Synth
        });
    };

    const onResetSyncPoints = () => {
        shouldStoreToUndo.current = true;
        setSyncPointInfo(s => {
            return s ? resetSyncPoints(api, s) : s;
        });
    };

    const onAutoSync = () => {
        shouldStoreToUndo.current = true;
        setSyncPointInfo(s => {
            return s ? autoSync(s, api) : s;
        });
    };

    return (
        <div className={styles['media-sync-editor']}>
            {isYoutubeModalOpen && (
                <div className={`${styles.modal} ${styles['modal-sm']}`}>
                    <div className={styles['modal-body']}>
                        <label htmlFor="newYoutubeUrl">YouTube URL:</label>
                        <input
                            id="newYoutubeUrl"
                            type="text"
                            defaultValue={newYoutubeUrl}
                            onInput={e => {
                                setNewYoutubeUrl((e.target as HTMLInputElement).value);
                            }}
                        />

                        <p>
                            Enabling the synchronization with YouTube, requires the use of Youtube APIs loaded from
                            youtube.com and youtube-nocookie.com. With pressing <strong>Load</strong> you accept the
                            load of these resources and accept related policies from Google and Youtube.
                            <ul>
                                <li>
                                    <a href="https://policies.google.com/technologies/cookies">Google Cookie Policy</a>
                                </li>
                                <li>
                                    <a href="https://policies.google.com/privacy">Google Privacy Policy</a>
                                </li>
                                <li>
                                    <a href="https://policies.google.com/terms">Google Terms of Service</a>
                                </li>
                            </ul>
                            It should be obvious that syncing with YouTube requires this, but we still want to inform
                            you of the impact.
                        </p>

                        <div className={styles['modal-actions']}>
                            <div data-tooltip-id="tooltip-playground" data-tooltip-content={newYoutubeUrlError}>
                                <button
                                    type="button"
                                    className="button button--primary"
                                    disabled={!!newYoutubeUrlError}
                                    onClick={() => {
                                        onLoadYouTubeVideo(newYoutubeUrl);
                                        setYoutubeModalOpen(false);
                                    }}>
                                    Load
                                </button>
                            </div>
                            <button
                                type="button"
                                className="button button--secondary"
                                onClick={() => {
                                    setYoutubeModalOpen(false);
                                }}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isGenerateCodeModalOpen && (
                <div className={`${styles.modal} ${styles['modal-lg']}`}>
                    <div className={styles['modal-body']}>
                        <h3>Generate Sync Code</h3>
                        The following code helps you setting up the sync points in your app. The exact logic depends on
                        your app, but generally you would store the sync points in parallel to the file (e.g. in a
                        database) and load them along the main file. Then when the file is loaded by alphaTab you
                        additionally apply the sync points.
                        <Tabs
                            defaultValue="ts"
                            values={[
                                { label: 'TypeScript', value: 'ts' },
                                { label: 'C#', value: 'cs' },
                                { label: 'Kotlin', value: 'kt' }
                            ]}>
                            <TabItem value="ts">
                                <CodeBlock language="typescript" title="SyncPoints">
                                    {[
                                        'const syncPoints: alphaTab.model.FlatSyncPoints[] = [',
                                        syncPointsToTypeScriptCode(syncPointInfo, '  '),
                                        '];'
                                    ].join('\n')}
                                </CodeBlock>
                                <CodeBlock language="typescript" title="Applying">
                                    {[
                                        '// Variant 1: constant/data available when score is loaded.',
                                        'api.scoreLoaded.on(score => {',
                                        '  score.backingTrack = new alphaTab.model.BackingTrack();',
                                        '  score.backingTrack.rawAudioFile = rawAudioFileBytes /*Uint8Array*/;',
                                        '  score.applyFlatSyncPoints(syncPoints);',
                                        '});',
                                        '',
                                        '// Variant 2: dynamic load and apply',
                                        'const syncPoints: alphaTab.model.FlatSyncPoints[] = await loadSyncPointsForScoreFromBackend(score);',
                                        'const rawAudioFileBytes: Uint8Array = await loadAudioForScoreFromBackend(score);',
                                        'api.score.applyFlatSyncPoints(syncPoints);',
                                        'api.score.backingTrack = new alphaTab.model.BackingTrack();',
                                        'api.score.backingTrack.rawAudioFile = rawAudioFileBytes;',
                                        'api.updateSettings();   // ensures the right backing track player is started',
                                        'api.updateSyncPoints(); // updates the sync points in the player'
                                    ].join('\n')}
                                </CodeBlock>
                            </TabItem>
                            <TabItem value="cs">
                                <CodeBlock language="csharp" title="SyncPoints">
                                    {[
                                        'var syncPoints = new AlphaTab.Model.FlatSyncPoints[]',
                                        '{',
                                        syncPointsToCSharpCode(syncPointInfo, '    '),
                                        '};'
                                    ].join('\n')}
                                </CodeBlock>
                                <CodeBlock language="csharp" title="Applying">
                                    {[
                                        '// Variant 1: constant/data available when score is loaded.',
                                        'api.ScoreLoaded.On(score =>',
                                        '{',
                                        '    score.BackingTrack = new AlphaTab.Model.BackingTrack();',
                                        '    score.BackingTrack.RawAudioFile = rawAudioFileBytes;',
                                        '    score.ApplyFlatSyncPoints(syncPoints);',
                                        '});',
                                        '',
                                        '// Variant 2: dynamic load and apply',
                                        'var syncPoints = await LoadSyncPointsForScore(score);',
                                        'var rawAudioFileBytes = await LoadAudioForScore(score);',
                                        'api.Score.ApplyFlatSyncPoints(syncPoints);',
                                        'api.Score.BackingTrack = new AlphaTab.Model.BackingTrack();',
                                        'api.Score.BackingTrack.RawAudioFile = rawAudioFileBytes;',
                                        'api.UpdateSettings();   // ensures the right backing track player is started',
                                        'api.UpdateSyncPoints(); // updates the sync points in the player'
                                    ].join('\n')}
                                </CodeBlock>
                            </TabItem>
                            <TabItem value="kt">
                                <CodeBlock language="kotlin" title="SyncPoints">
                                    {[
                                        'val syncPoints: Array<alphaTab.model.FlatSyncPoints> = arrayOf(',
                                        syncPointsToKotlinCode(syncPointInfo, '  '),
                                        ')'
                                    ].join('\n')}
                                </CodeBlock>
                                <CodeBlock language="kotlin" title="Applying">
                                    {[
                                        '// Variant 1: constant/data available when score is loaded.',
                                        'api.scoreLoaded.on{ score ->',
                                        '  score.backingTrack = alphaTab.model.BackingTrack();',
                                        '  score.backingTrack.rawAudioFile = rawAudioFileBytes;',
                                        '  score.applyFlatSyncPoints(syncPoints);',
                                        '}',
                                        '',
                                        '// Variant 2: dynamic load and apply',
                                        'val syncPoints = loadSyncPointsForScore(score);',
                                        'val rawAudioFileBytes = loadAudioForScore(score);',
                                        'api.score.applyFlatSyncPoints(syncPoints);',
                                        'api.score.backingTrack = alphaTab.model.BackingTrack();',
                                        'api.score.backingTrack.rawAudioFile = rawAudioFileBytes;',
                                        'api.updateSettings();   // ensures the right backing track player is started',
                                        'api.updateSyncPoints(); // updates the sync points in the player'
                                    ].join('\n')}
                                </CodeBlock>
                            </TabItem>
                        </Tabs>
                        <div className={styles['modal-actions']}>
                            <button
                                type="button"
                                className="button button--secondary"
                                onClick={() => {
                                    setGenerateCodeModalOpen(false);
                                }}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className={styles.toolbar}>
                <div>
                    <div className={styles['button-group']}>
                        <button
                            className={`button ${mediaType.type === MediaType.Synth ? 'button--primary' : 'button--secondary'}`}
                            type="button"
                            data-tooltip-id="tooltip-playground"
                            onClick={() => {
                                onLoadSynthesizer();
                            }}>
                            <FontAwesomeIcon icon={solid.faWaveSquare} /> Synthesizer
                        </button>
                        <button
                            className={`button ${mediaType.type === MediaType.Audio ? 'button--primary' : 'button--secondary'}`}
                            type="button"
                            data-tooltip-id="tooltip-playground"
                            onClick={() => {
                                onLoadAudioFile();
                            }}>
                            <FontAwesomeIcon icon={solid.faFileAudio} /> Audio Track
                        </button>
                        <button
                            className={`button ${mediaType.type === MediaType.YouTube ? 'button--primary' : 'button--secondary'}`}
                            type="button"
                            data-tooltip-id="tooltip-playground"
                            onClick={() => {
                                onLoadYouTube();
                            }}>
                            <FontAwesomeIcon icon={brands.faYoutube} /> Youtube Video
                        </button>
                    </div>
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
                                setSyncPointInfo(i);
                            });
                        }}>
                        <FontAwesomeIcon icon={solid.faRedo} />
                    </button>
                </div>

                <div>
                    {mediaType.type === MediaType.Audio && (
                        <button
                            className="button button--secondary"
                            type="button"
                            onClick={() => {
                                downloadFile(api);
                            }}>
                            <FontAwesomeIcon icon={solid.faDownload} /> Download Synced GP File
                        </button>
                    )}
                    {(mediaType.type === MediaType.YouTube || mediaType.type === MediaType.Audio) && (
                        <button
                            className="button button--secondary"
                            type="button"
                            onClick={() => {
                                setGenerateCodeModalOpen(true);
                            }}>
                            <FontAwesomeIcon icon={solid.faCode} /> Generate Sync Code
                        </button>
                    )}
                </div>
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
                        endTime={syncPointInfo.endTime}
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
                        shouldStoreToUndo.current = true;
                        setSyncPointInfo(newInfo);
                    }}
                    onSeek={pos => {
                        setPlaybackTime(pos);
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
