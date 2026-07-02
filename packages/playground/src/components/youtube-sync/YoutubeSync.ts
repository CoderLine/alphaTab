import type * as alphaTab from '@coderline/alphatab';
import { type Mountable, css, html, injectStyles, parseHtml } from '../../util/Dom';

injectStyles(
    'YoutubeSync',
    css`
    .at-youtube-wrap {
        display: flex;
        justify-content: center;
        height: 360px;
        background: #000;
    }
    .at-youtube-wrap > .at-youtube { width: 640px; height: 360px; }
`
);

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

export interface YoutubeSyncProps {
    videoId: string;
}

export class YoutubeSync implements Mountable {
    readonly root: HTMLElement;
    private playerEl: HTMLElement;
    private player: YTPlayer | null = null;
    private currentTimeInterval: number | undefined;

    constructor(
        private api: alphaTab.AlphaTabApi,
        private props: YoutubeSyncProps
    ) {
        this.root = parseHtml(html`
            <div class="at-youtube-wrap">
                <div class="at-youtube"></div>
            </div>
        `);
        this.playerEl = this.root.querySelector('.at-youtube')!;
        this.bind();
    }

    private async bind(): Promise<void> {
        await loadYouTubeApi();
        const ready = Promise.withResolvers<void>();
        this.player = new window.YT!.Player(this.playerEl, {
            height: '360',
            width: '640',
            videoId: this.props.videoId,
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

        const output = this.api.player?.output as alphaTab.synth.IExternalMediaSynthOutput | undefined;
        if (!output) {
            return;
        }
        const player = this.player!;
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
        this.clearInterval();
        this.player?.destroy?.();
        this.root.remove();
    }
}
