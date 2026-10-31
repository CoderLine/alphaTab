import type * as alphaTab from '@coderline/alphatab';

// Minimal YouTube IFrame API surface used by this component.
interface YTPlayer {
    getDuration(): number;
    getPlaybackRate(): number;
    setPlaybackRate(value: number): void;
    getVolume(): number;
    setVolume(value: number): void;
    seekTo(seconds: number): void;
    playVideo(): void;
    pauseVideo(): void;
    getCurrentTime(): number;
    destroy?(): void;
}
interface YTEvent {
    data: number;
}
interface YTPlayerCtor {
    new (
        host: HTMLElement,
        options: {
            height: string;
            width: string;
            videoId: string;
            playerVars?: { autoplay?: 0 | 1 };
            events?: {
                onReady?: (e: YTEvent) => void;
                onStateChange?: (e: YTEvent) => void;
                onPlaybackRateChange?: (e: YTEvent) => void;
                onError?: (e: YTEvent) => void;
            };
        }
    ): YTPlayer;
}
interface YTNamespace {
    Player: YTPlayerCtor;
}

declare global {
    interface Window {
        YT?: YTNamespace;
        onYouTubePlayerAPIReady?: () => void;
    }
}

const YT_API_URL = 'https://www.youtube.com/player_api';
let ytApiPromise: Promise<void> | null = null;

function loadYouTubeApi(): Promise<void> {
    if (ytApiPromise) {
        return ytApiPromise;
    }
    ytApiPromise = new Promise<void>((resolve, reject) => {
        if (window.YT?.Player) {
            resolve();
            return;
        }
        const previous = window.onYouTubePlayerAPIReady;
        window.onYouTubePlayerAPIReady = () => {
            previous?.();
            resolve();
        };
        const tag = document.createElement('script');
        tag.src = YT_API_URL;
        tag.onerror = e => reject(e);
        document.head.appendChild(tag);
    });
    return ytApiPromise;
}

/**
 * Plays a YouTube video as the external media of an API in `PlayerMode.EnabledExternalMedia`: the
 * video's state drives alphaTab, and alphaTab's transport controls the video through the handler.
 */
export class YoutubeSync {
    private player: YTPlayer | null = null;
    private currentTimeInterval: number | undefined;
    private disposed = false;
    private readonly unsubscribePlayerReady: () => void;

    /** Replaces the content of `host` with the video player. */
    constructor(
        private readonly api: alphaTab.AlphaTabApi,
        private readonly host: HTMLElement,
        private readonly videoId: string
    ) {
        // alphaTab creates a new output whenever it rebuilds its player.
        this.unsubscribePlayerReady = api.playerReady.on(() => this.installHandler());
        this.bind().catch(e => console.error('YouTube player failed to start', e));
    }

    private async bind(): Promise<void> {
        await loadYouTubeApi();
        if (this.disposed) {
            return;
        }
        const ready = Promise.withResolvers<void>();
        const placeholder = document.createElement('div');
        this.host.replaceChildren(placeholder);
        this.player = new window.YT!.Player(placeholder, {
            height: '360',
            width: '640',
            videoId: this.videoId,
            playerVars: { autoplay: 0 },
            events: {
                onReady: () => ready.resolve(),
                onStateChange: e => this.onStateChange(e.data),
                onPlaybackRateChange: e => {
                    this.api.playbackSpeed = e.data;
                },
                onError: e => ready.reject(e)
            }
        });
        await ready.promise;
        this.installHandler();
    }

    private installHandler(): void {
        const player = this.player;
        const output = this.api.player?.output as alphaTab.synth.IExternalMediaSynthOutput | undefined;
        if (!player || !output || this.disposed) {
            return;
        }
        const handler: alphaTab.synth.IExternalMediaHandler = {
            get backingTrackDuration() {
                return player.getDuration() * 1000;
            },
            get playbackRate() {
                return player.getPlaybackRate();
            },
            set playbackRate(value: number) {
                player.setPlaybackRate(value);
            },
            get masterVolume() {
                return player.getVolume() / 100;
            },
            set masterVolume(value: number) {
                player.setVolume(value * 100);
            },
            seekTo: time => player.seekTo(time / 1000),
            play: () => player.playVideo(),
            pause: () => player.pauseVideo()
        };
        output.handler = handler;
    }

    private onStateChange(state: number): void {
        // YT.PlayerState: -1=unstarted, 0=ended, 1=playing, 2=paused, 3=buffering, 5=cued
        switch (state) {
            case 1: // playing
                this.clearInterval();
                this.currentTimeInterval = window.setInterval(() => {
                    const output = this.api.player?.output as alphaTab.synth.IExternalMediaSynthOutput | undefined;
                    if (output && this.player) {
                        output.updatePosition(this.player.getCurrentTime() * 1000);
                    }
                }, 50);
                this.api.play();
                break;
            case 0: // ended
                this.clearInterval();
                this.api.stop();
                break;
            case 2: // paused
                this.clearInterval();
                this.api.pause();
                break;
        }
    }

    private clearInterval(): void {
        if (this.currentTimeInterval !== undefined) {
            window.clearInterval(this.currentTimeInterval);
            this.currentTimeInterval = undefined;
        }
    }

    dispose(): void {
        this.disposed = true;
        this.unsubscribePlayerReady();
        this.clearInterval();
        this.player?.destroy?.();
        this.player = null;
        this.host.replaceChildren();
    }
}
