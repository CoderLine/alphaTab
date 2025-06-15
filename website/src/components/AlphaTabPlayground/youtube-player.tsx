'use client';

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { extractYouTubeVideoId, type HTMLMediaElementLike } from './helpers';
import useIsBrowser from '@docusaurus/useIsBrowser';

export type YouTubePlayerProps = {
    src: string;
};

enum YoutubeIFrameApiPlayerState {
    Unstarted = -1,
    Ended = 0,
    Playing = 1,
    Paused = 2,
    Buffering = 3,
    VideoCued = 5
}

type YoutubeIFrameApiPlayerOptions = {
    width?: number;
    height?: number;
    host?: string;
    videoId?: string;
    playerVars?: {
        autoplay?: 0 | 1;
    };
    events?: {
        onReady?(e: { target: YoutubeIFrameApiPlayer }): void;
        onStateChange?(e: { data: YoutubeIFrameApiPlayerState }): void;
        onPlaybackRateChange?(e: { data: number }): void;
    };
};
/**
 * @see https://developers.google.com/youtube/iframe_api_reference
 */
declare class YoutubeIFrameApiPlayer {
    readonly id: number;
    constructor(element: HTMLElement | string, options: YoutubeIFrameApiPlayerOptions);
    getCurrentTime(): number;
    getVolume(): number;
    getDuration(): number;
    getPlaybackRate(): number;
    setVolume(volume: number): void;
    setPlaybackRate(suggestedRate: number): void;
    seekTo(seconds: number): void;
    destroy(): void;
    playVideo(): void;
    pauseVideo(): void;
    cuePlaylist(playlist: string[]): void;
}

type YoutubeIFrameApi = {
    Player: typeof YoutubeIFrameApiPlayer;
};


function useYoutubeIFrameApi(): YoutubeIFrameApi | null {
    const [youtubeApiLoaded, setYoutubeApiLoaded] = useState<boolean>('YT' in globalThis);
    const iframeApiUrl = 'https://www.youtube.com/iframe_api';

    const isBrowser = useIsBrowser();
    if (!isBrowser) {
        return null;
    }

    // decoupling of local react component state and global YT callbacks
    const shouldListen = useRef(false);
    const safeSetLoaded = useCallback(() => {
        if (shouldListen.current) {
            setYoutubeApiLoaded(true);
        }
    }, []);
    useEffect(() => {
        return () => {
            shouldListen.current = false;
        };
    }, []);

    if (!youtubeApiLoaded) {
        type YoutubeApiScriptTag = HTMLScriptElement & {
            completionPromise: Promise<void>;
        };
        let script = document.head.querySelector<YoutubeApiScriptTag>(`script[src=${JSON.stringify(iframeApiUrl)}]`);
        if (!script) {
            // initiate load of API via script tag
            script = document.createElement('script') as YoutubeApiScriptTag;
            script.src = iframeApiUrl;
            const completePromise = Promise.withResolvers<void>();
            (window as any).onYouTubeIframeAPIReady = () => {
                completePromise.resolve();
            };
            script.completionPromise = completePromise.promise;
            document.head.appendChild(script);
        }

        if (shouldListen.current === false) {
            shouldListen.current = true;
            script!.completionPromise.then(() => {
                safeSetLoaded();
            });
        }
    }

    return 'YT' in globalThis && globalThis.YT.loaded ? globalThis.YT : null;
}

export interface YouTubePlayerRef extends HTMLMediaElementLike {}

export const YouTubePlayer = forwardRef<YouTubePlayerRef, YouTubePlayerProps>(({ src }, ref) => {
    const iframeApi = useYoutubeIFrameApi();
    const iframeApiPlayer = useRef<YoutubeIFrameApiPlayer | null>(null);
    const eventTarget = useRef(new EventTarget());

    // state without render
    const initialSeek = useRef(-1);
    const playerState = useRef<YoutubeIFrameApiPlayerState>(YoutubeIFrameApiPlayerState.Unstarted);
    const api = useRef<YouTubePlayerRef>({
        get currentTime() {
            return iframeApiPlayer.current?.getCurrentTime() ?? 0;
        },
        set currentTime(value: number) {
            if (iframeApiPlayer.current) {
                // Youtube API:
                // If the player is paused when the function is called, it will remain paused.
                // If the function is called from another state (playing, video cued, etc.), the player will play the video.

                // this is quite annoying. we want to seek without starting the playback.
                // maybe we find another trick to seek without starting playback?
                if (
                    playerState.current !== YoutubeIFrameApiPlayerState.Paused &&
                    playerState.current !== YoutubeIFrameApiPlayerState.Playing
                ) {
                    initialSeek.current = value;
                } else {
                    console.log('Seek to ', value);
                    iframeApiPlayer.current.seekTo(value);
                }
            }
        },
        get volume(): number {
            return iframeApiPlayer.current?.getVolume() ?? 1;
        },
        set volume(value: number) {
            if (iframeApiPlayer.current) {
                iframeApiPlayer.current.setVolume(value);
            }
        },
        get playbackRate(): number {
            return iframeApiPlayer.current?.getPlaybackRate() ?? 1;
        },
        set playbackRate(value: number) {
            if (iframeApiPlayer.current) {
                iframeApiPlayer.current.setPlaybackRate(value);
            }
        },
        get duration(): number {
            return iframeApiPlayer.current?.getDuration() ?? 0;
        },
        addEventListener(eventType, handler) {
            eventTarget.current.addEventListener(eventType, handler);
        },
        removeEventListener(eventType, handler) {
            eventTarget.current.removeEventListener(eventType, handler);
        },
        play() {
            if (iframeApiPlayer.current) {
                iframeApiPlayer.current.playVideo();
                if (initialSeek.current >= 0) {
                    iframeApiPlayer.current.seekTo(initialSeek.current);
                    initialSeek.current = -1;
                }
            }
        },
        pause() {
            if (iframeApiPlayer.current) {
                iframeApiPlayer.current.pauseVideo();
            }
        }
    });

    useImperativeHandle(ref, () => api.current, [api]);

    const currentTimeInterval = useRef<number>(0);

    const wrapperRef = useRef<HTMLDivElement | null>(null);

    // there is no "seek" event from youtube, we listen to the internal events and decide based on state
    useEffect(() => {
        const globalListener = (e: MessageEvent) => {
            if (e.origin === 'https://www.youtube.com') {
                let data: any;
                try {
                    data = JSON.parse(e.data);
                } catch (e) {
                    return;
                }

                const currentPlayerId = iframeApiPlayer.current?.id;
                if (data.id === currentPlayerId) {
                    if (data.event === 'infoDelivery') {
                        switch (playerState.current) {
                            case YoutubeIFrameApiPlayerState.Paused:
                                setTimeout(() => {
                                    eventTarget.current.dispatchEvent(new Event('seeked'));
                                }, 0);
                                break;
                        }
                    }
                }
            }
        };

        window.addEventListener('message', globalListener);

        return () => {
            window.removeEventListener('message', globalListener);
        };
    }, [iframeApiPlayer]);

    const pausedDelay = useRef<number>(0);
    const setWrapperRef = useCallback(
        node => {
            wrapperRef.current = node;
            if (iframeApiPlayer.current) {
                iframeApiPlayer.current.destroy();
                iframeApiPlayer.current = null;
            }

            if (iframeApi && node) {
                new iframeApi.Player(node, {
                    host: 'https://www.youtube-nocookie.com',
                    playerVars: { autoplay: 0 },
                    events: {
                        onReady: e => {
                            iframeApiPlayer.current = e.target;
                            (window as any).youtubePlayer = e.target;
                            const id = extractYouTubeVideoId(src);
                            if (id) {
                                iframeApiPlayer.current.cuePlaylist([id]);
                            }
                        },
                        onStateChange: e => {
                            if (playerState.current === e.data) {
                                return;
                            }
                            
                            clearInterval(pausedDelay.current);
                            pausedDelay.current = 0;

                            switch (e.data as YoutubeIFrameApiPlayerState) {
                                case YoutubeIFrameApiPlayerState.Playing:
                                    playerState.current = e.data;
                                    window.clearInterval(currentTimeInterval.current);
                                    currentTimeInterval.current = window.setInterval(() => {
                                        eventTarget.current.dispatchEvent(new Event('timeupdate'));
                                    }, 50);

                                    eventTarget.current.dispatchEvent(new Event('play'));
                                    break;
                                case YoutubeIFrameApiPlayerState.Ended:
                                    playerState.current = e.data;
                                    window.clearInterval(currentTimeInterval.current);
                                    currentTimeInterval.current = 0;
                                    eventTarget.current.dispatchEvent(new Event('ended'));
                                    break;
                                case YoutubeIFrameApiPlayerState.Paused:
                                    pausedDelay.current = window.setTimeout(() => {
                                        playerState.current = e.data;
                                        window.clearInterval(currentTimeInterval.current);
                                        currentTimeInterval.current = 0;
                                        eventTarget.current.dispatchEvent(new Event('pause'));
                                    }, 300);

                                    break;
                                case YoutubeIFrameApiPlayerState.VideoCued:
                                    playerState.current = e.data;
                                    eventTarget.current.dispatchEvent(new Event('durationchange'));
                                    eventTarget.current.dispatchEvent(new Event('loadedmetadata'));
                                    break;
                                default:
                                    playerState.current = e.data;
                                    break;
                            }
                        },
                        onPlaybackRateChange: () => {
                            eventTarget.current.dispatchEvent(new Event('ratechange'));
                        }
                    }
                }) as YoutubeIFrameApiPlayer;
            }
        },
        [iframeApi, src]
    );

    // destroy
    useEffect(() => {
        return () => {
            if (iframeApiPlayer.current) {
                iframeApiPlayer.current.destroy();
                iframeApiPlayer.current = null;
            }
            window.clearInterval(currentTimeInterval.current);
        };
    }, []);

    // initialize when iframe API is available
    useEffect(() => {
        if (wrapperRef.current) {
            setWrapperRef(wrapperRef.current);
        }
    }, [iframeApi]);

    useEffect(() => {
        if (iframeApiPlayer.current) {
            const id = extractYouTubeVideoId(src);
            if (id) {
                iframeApiPlayer.current.cuePlaylist([id]);
            }
        }
    }, [src, iframeApiPlayer.current]);

    return <div ref={setWrapperRef} style={{ width: '100%', height: 'auto', aspectRatio: '16/9' }} />;
});
