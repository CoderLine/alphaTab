import type { MediaElementLike, MediaElementLikeEvent } from '@coderline/alphatab-ui';

interface YouTubePlayer {
    playVideo(): void;
    pauseVideo(): void;
    seekTo(seconds: number, allowSeekAhead: boolean): void;
    getCurrentTime(): number;
    getDuration(): number;
    getVolume(): number;
    setVolume(volume: number): void;
    isMuted(): boolean;
    unMute(): void;
    getPlaybackRate(): number;
    setPlaybackRate(rate: number): void;
    destroy(): void;
}

interface YouTubeNamespace {
    Player: new (
        element: HTMLElement,
        options: {
            host?: string;
            videoId: string;
            width?: string | number;
            height?: string | number;
            playerVars?: Record<string, string | number>;
            events?: Record<string, (event: { data: number; target: YouTubePlayer }) => void>;
        },
    ) => YouTubePlayer;
}

declare global {
    interface Window {
        YT?: YouTubeNamespace;
        onYouTubeIframeAPIReady?: () => void;
    }
}

const PLAYER_STATE = { ENDED: 0, PLAYING: 1, PAUSED: 2, CUED: 5 } as const;
const TIME_UPDATE_MS = 100;
/** The player reports the old position for a moment after `seekTo`. */
const SEEK_SETTLE_MS = 600;

let apiPromise: Promise<YouTubeNamespace> | null = null;

function loadYouTubeApi(): Promise<YouTubeNamespace> {
    if (window.YT?.Player) { return Promise.resolve(window.YT); }
    apiPromise ??= new Promise<YouTubeNamespace>((resolve, reject) => {
        const previous = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = () => {
            previous?.();
            resolve(window.YT!);
        };
        const script = document.createElement('script');
        script.src = 'https://www.youtube.com/iframe_api';
        script.async = true;
        script.onerror = () => {
            apiPromise = null;
            reject(new Error('the YouTube player could not be loaded'));
        };
        document.head.appendChild(script);
    });
    return apiPromise;
}

/** Accepts youtube.com/watch, youtu.be, /embed/, /shorts/ and youtube-nocookie links, or a bare 11-character id. */
export function extractYouTubeVideoId(input: string): string | null {
    const text = input.trim();
    if (/^[\w-]{11}$/.test(text)) { return text; }
    try {
        const url = new URL(text);
        const host = url.hostname.replace(/^www\.|^m\./, '').toLowerCase();
        if (host === 'youtu.be') { return url.pathname.split('/')[1] || null; }
        if (host === 'youtube.com' || host === 'youtube-nocookie.com' || host === 'music.youtube.com') {
            const v = url.searchParams.get('v');
            if (v) { return v; }
            const match = /^\/(embed|shorts|live|v)\/([\w-]{11})/.exec(url.pathname);
            return match?.[2] ?? null;
        }
    } catch {
        // not a URL
    }
    return null;
}

/** A YouTube video behind the `HTMLMediaElement` subset alphaTab's external media mode uses. */
export class YouTubeMedia extends EventTarget implements MediaElementLike {
    private player: YouTubePlayer | null = null;
    private timer = 0;
    private started = false;
    private pendingSeek: number | null = null;
    private seekTarget: { time: number; until: number } | null = null;
    private volumeValue = 1;
    private rateValue = 1;
    private pausedValue = true;
    private destroyed = false;

    /** Creates the player inside `host` (which YouTube replaces with its iframe). */
    static async create(host: HTMLElement, videoId: string): Promise<YouTubeMedia> {
        const yt = await loadYouTubeApi();
        const media = new YouTubeMedia();
        await new Promise<void>((resolve, reject) => {
            const player = new yt.Player(host, {
                host: 'https://www.youtube-nocookie.com',
                videoId,
                width: '100%',
                height: '100%',
                playerVars: { playsinline: 1, rel: 0, modestbranding: 1 },
                events: {
                    onReady: () => {
                        media.player = player;
                        media.volumeValue = player.isMuted() ? 0 : player.getVolume() / 100;
                        media.rateValue = player.getPlaybackRate();
                        resolve();
                        media.emit('loadedmetadata');
                        media.emit('durationchange');
                    },
                    onError: (e) => reject(new Error(`YouTube error ${e.data}`)),
                    onStateChange: (e) => media.onStateChange(e.data),
                    onPlaybackRateChange: (e) => media.onRateChange(e.data),
                },
            });
        });
        return media;
    }

    get currentTime(): number {
        if (this.pendingSeek !== null) { return this.pendingSeek; }
        if (this.seekTarget && performance.now() < this.seekTarget.until) { return this.seekTarget.time; }
        return this.player?.getCurrentTime() ?? 0;
    }

    set currentTime(value: number) {
        if (!this.player) { return; }
        if (!this.started) {
            // Seeking an unstarted video starts playback; apply it on the first play instead.
            this.pendingSeek = value;
        } else {
            this.player.seekTo(value, true);
            this.seekTarget = { time: value, until: performance.now() + SEEK_SETTLE_MS };
        }
        this.emit('seeked');
        this.emit('timeupdate');
    }

    get duration(): number {
        const d = this.player?.getDuration() ?? 0;
        return d > 0 ? d : NaN;
    }

    get paused(): boolean {
        return this.pausedValue;
    }

    get volume(): number {
        return this.volumeValue;
    }

    set volume(value: number) {
        const v = Math.min(1, Math.max(0, value));
        if (Math.abs(v - this.volumeValue) < 0.005) { return; }
        this.volumeValue = v;
        if (v > 0 && this.player?.isMuted()) { this.player.unMute(); }
        this.player?.setVolume(Math.round(v * 100));
        this.emit('volumechange');
    }

    get playbackRate(): number {
        return this.rateValue;
    }

    set playbackRate(value: number) {
        if (Math.abs(value - this.rateValue) < 0.001) { return; }
        this.rateValue = value;
        // YouTube offers a fixed set of rates and reports the one it picked via onPlaybackRateChange.
        this.player?.setPlaybackRate(value);
        this.emit('ratechange');
    }

    play(): void {
        this.player?.playVideo();
    }

    pause(): void {
        this.player?.pauseVideo();
    }

    destroy(): void {
        if (this.destroyed) { return; }
        this.destroyed = true;
        window.clearInterval(this.timer);
        this.player?.destroy();
        this.player = null;
    }

    private emit(type: MediaElementLikeEvent): void {
        if (!this.destroyed) { this.dispatchEvent(new Event(type)); }
    }

    private onStateChange(state: number): void {
        switch (state) {
            case PLAYER_STATE.PLAYING:
                if (!this.started) {
                    this.started = true;
                    if (this.pendingSeek !== null) {
                        const seek = this.pendingSeek;
                        this.pendingSeek = null;
                        this.player?.seekTo(seek, true);
                        this.seekTarget = { time: seek, until: performance.now() + SEEK_SETTLE_MS };
                    }
                }
                this.pausedValue = false;
                window.clearInterval(this.timer);
                this.timer = window.setInterval(() => this.emit('timeupdate'), TIME_UPDATE_MS);
                this.emit('play');
                break;
            case PLAYER_STATE.PAUSED:
                this.pausedValue = true;
                window.clearInterval(this.timer);
                this.emit('pause');
                break;
            case PLAYER_STATE.ENDED:
                this.pausedValue = true;
                window.clearInterval(this.timer);
                this.emit('ended');
                break;
            case PLAYER_STATE.CUED:
                this.emit('durationchange');
                break;
        }
    }

    private onRateChange(rate: number): void {
        if (Math.abs(rate - this.rateValue) < 0.001) { return; }
        this.rateValue = rate;
        this.emit('ratechange');
    }
}
