'use client';

import * as alphaTab from '@coderline/alphatab';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useAlphaTab, useAlphaTabEvent } from '@site/src/hooks';
import styles from './styles.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as solid from '@fortawesome/free-solid-svg-icons';
import { openFile } from '@site/src/utils';
import { BottomPanel, PlayerControlsGroup, SidePanel } from './player-controls-group';
import { PlaygroundSettings } from './playground-settings';
import { Tooltip } from 'react-tooltip';
import { PlaygroundTrackSelector } from './track-selector';
import { MediaSyncEditor } from './media-sync-editor';
import { type HTMLMediaElementLike, MediaType, type MediaTypeState } from './helpers';
import { YouTubePlayer } from './youtube-player';

export const AlphaTabPlayground: React.FC = () => {
    const viewPortRef = React.createRef<HTMLDivElement>();
    const [isLoading, setLoading] = useState(true);
    const [sidePanel, setSidePanel] = useState(SidePanel.None);
    const [bottomPanel, setBottomPanel] = useState(BottomPanel.None);
    const [mediaType, setMediaType] = useState<MediaTypeState>({
        type: MediaType.Synth
    });
    const youtubePlayer = useRef<HTMLMediaElementLike | null>(null);

    const [api, element] = useAlphaTab(s => {
        s.core.engine = 'svg';
        s.core.file = '/files/canon-full.gp';
        s.core.tracks = [0, 1];
        s.player.scrollElement = viewPortRef.current!;
        s.player.scrollOffsetY = -10;
        s.player.playerMode = alphaTab.PlayerMode.EnabledSynthesizer;
    });

    useAlphaTabEvent(api, 'renderFinished', () => {
        setLoading(false);
    });

    const onDragOver = (e: React.DragEvent) => {
        e.stopPropagation();
        e.preventDefault();
        if (e.dataTransfer) {
            e.dataTransfer.dropEffect = 'link';
        }
    };

    const onDrop = (e: React.DragEvent) => {
        e.stopPropagation();
        e.preventDefault();
        if (e.dataTransfer) {
            const files = e.dataTransfer.files;
            if (files.length === 1) {
                openFile(api!, files[0]);
            }
        }
    };

    const youtubePlayerUnsubscribe = useRef<() => void>(null);
    const setYoutubePlayer = useCallback(
        (newPlayer: HTMLMediaElementLike) => {
            if (youtubePlayerUnsubscribe.current) {
                youtubePlayerUnsubscribe.current();
                youtubePlayerUnsubscribe.current = null;
            }

            if (newPlayer && api) {
                youtubePlayer.current = newPlayer;

                const onLoadedMetadata = () => {
                    setMediaType(t => ({
                        ...t,
                        youtubeVideoDuration: newPlayer.duration * 1000
                    }));
                };
                const onTimeUpdate = () => {
                    if (api!.actualPlayerMode === alphaTab.PlayerMode.EnabledExternalMedia) {
                        (api!.player!.output as alphaTab.synth.IExternalMediaSynthOutput).updatePosition(
                            newPlayer.currentTime * 1000
                        );
                    }
                };

                const onPlay = () => {
                    api.play();
                };
                const onPause = () => {
                    api.pause();
                };

                const onEnded = () => {
                    api.pause();
                };

                const onVolumeChange = () => {
                    api.masterVolume = newPlayer.volume;
                };

                const onRateChange = () => {
                    api.playbackSpeed = newPlayer.playbackRate;
                };

                newPlayer.addEventListener('loadedmetadata', onLoadedMetadata);
                newPlayer.addEventListener('timeupdate', onTimeUpdate);
                newPlayer.addEventListener('seeked', onTimeUpdate);
                newPlayer.addEventListener('play', onPlay);
                newPlayer.addEventListener('pause', onPause);
                newPlayer.addEventListener('ended', onEnded);
                newPlayer.addEventListener('volumechange', onVolumeChange);
                newPlayer.addEventListener('ratechange', onRateChange);
                newPlayer.addEventListener('volumechange', onVolumeChange);
                newPlayer.addEventListener('ratechange', onRateChange);

                youtubePlayerUnsubscribe.current = () => {
                    newPlayer.removeEventListener('loadedmetadata', onLoadedMetadata);
                    newPlayer.removeEventListener('timeupdate', onTimeUpdate);
                    newPlayer.removeEventListener('seeked', onTimeUpdate);
                    newPlayer.removeEventListener('play', onPlay);
                    newPlayer.removeEventListener('pause', onPause);
                    newPlayer.removeEventListener('ended', onEnded);
                    newPlayer.removeEventListener('volumechange', onVolumeChange);
                    newPlayer.removeEventListener('ratechange', onRateChange);
                    newPlayer.removeEventListener('volumechange', onVolumeChange);
                    newPlayer.removeEventListener('ratechange', onRateChange);
                };
            }
        },
        [api]
    );

    useEffect(() => {
        if (!api) {
            return;
        }

        api.pause();
        switch (mediaType.type) {
            case MediaType.Synth:
                api.settings.player.playerMode = alphaTab.PlayerMode.EnabledSynthesizer;
                api.updateSettings();
                break;

            case MediaType.Audio:
                api.settings.player.playerMode = alphaTab.PlayerMode.EnabledBackingTrack;
                api.updateSettings();

                break;

            case MediaType.YouTube:
                api.settings.player.playerMode = alphaTab.PlayerMode.EnabledExternalMedia;
                api.updateSettings();

                const handler: alphaTab.synth.IExternalMediaHandler = {
                    get backingTrackDuration() {
                        const duration = youtubePlayer.current?.duration ?? 0;
                        return Number.isFinite(duration) ? duration * 1000 : 0;
                    },
                    get playbackRate() {
                        return youtubePlayer.current?.duration ?? 1;
                    },
                    set playbackRate(value) {
                        if (youtubePlayer.current) {
                            youtubePlayer.current.playbackRate = value;
                        }
                    },
                    get masterVolume() {
                        return youtubePlayer.current?.volume ?? 1;
                    },
                    set masterVolume(value) {
                        if (youtubePlayer.current) {
                            youtubePlayer.current.volume = value;
                        }
                    },
                    seekTo(time) {
                        if (youtubePlayer.current) {
                            youtubePlayer.current.currentTime = time / 1000;
                        }
                    },
                    play() {
                        if (youtubePlayer.current) {
                            youtubePlayer.current.play();
                        }
                    },
                    pause() {
                        if (youtubePlayer.current) {
                            youtubePlayer.current.pause();
                        }
                    }
                };

                (api.player!.output as alphaTab.synth.IExternalMediaSynthOutput).handler = handler;

                break;
        }
    }, [api, mediaType]);

    return (
        <>
            <div className={styles['at-wrap']} onDragOver={onDragOver} onDrop={onDrop}>
                {isLoading && (
                    <div className={styles['at-overlay']}>
                        <div className={styles['at-overlay-content']}>
                            <FontAwesomeIcon icon={solid.faSpinner} size="2x" spin={true} />
                        </div>
                    </div>
                )}

                {api && api?.score && (
                    <PlaygroundSettings
                        api={api}
                        onClose={() => setSidePanel(SidePanel.None)}
                        isOpen={sidePanel === SidePanel.Settings}
                    />
                )}

                {api && api?.score && (
                    <PlaygroundTrackSelector
                        api={api}
                        onClose={() => setSidePanel(SidePanel.None)}
                        isOpen={sidePanel === SidePanel.TrackSelector}
                    />
                )}

                <div className={styles['at-content']}>
                    <div className={styles['at-viewport']} ref={viewPortRef}>
                        <div ref={element} />
                    </div>

                    {mediaType.type === MediaType.YouTube && (
                        <div className={styles.video}>
                            <YouTubePlayer ref={setYoutubePlayer} src={mediaType.youtubeUrl!} />
                        </div>
                    )}
                </div>

                <div className={styles['at-footer']}>
                    {api && api?.score && bottomPanel === BottomPanel.MediaSyncEditor && (
                        <MediaSyncEditor
                            api={api}
                            score={api!.score}
                            mediaType={mediaType}
                            onMediaTypeChange={t => setMediaType(t)}
                            youtubePlayer={youtubePlayer.current ?? undefined}
                        />
                    )}
                    {api && (
                        <PlayerControlsGroup
                            api={api}
                            sidePanel={sidePanel}
                            onSidePanelChange={setSidePanel}
                            bottomPanel={bottomPanel}
                            onBottomPanelChange={setBottomPanel}
                        />
                    )}
                </div>
            </div>
            <Tooltip anchorSelect="[data-tooltip-content]" id="tooltip-playground" style={{ zIndex: 1200 }} />
        </>
    );
};
