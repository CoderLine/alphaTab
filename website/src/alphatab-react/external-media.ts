import type { AlphaTabApi, synth } from '@coderline/alphatab';

export type MediaElementLikeEvent =
    | 'timeupdate'
    | 'durationchange'
    | 'seeked'
    | 'play'
    | 'pause'
    | 'ended'
    | 'volumechange'
    | 'ratechange'
    | 'loadedmetadata';

/** The subset of `HTMLMediaElement` alphaTab's external media mode needs; times in seconds, volume 0..1. */
export interface MediaElementLike {
    currentTime: number;
    volume: number;
    playbackRate: number;
    readonly duration: number;
    readonly paused: boolean;
    addEventListener(type: MediaElementLikeEvent, listener: () => void): void;
    removeEventListener(type: MediaElementLikeEvent, listener: () => void): void;
    play(): void;
    pause(): void;
}

/** Where media-side changes (the user using the media's own controls) are reported to. */
export interface ExternalMediaTarget {
    play(): void;
    pause(): void;
    setMasterVolume(value: number): void;
    setPlaybackSpeed(value: number): void;
}

function isExternalMediaOutput(output: synth.ISynthOutput | undefined): output is synth.IExternalMediaSynthOutput {
    return !!output && 'updatePosition' in output && 'handler' in output;
}

/**
 * Drives `api` in `PlayerMode.EnabledExternalMedia` from `media` and vice versa. Media time maps 1:1
 * to alphaTab's backing-track time (the playback rate is applied by the media itself). The handler is
 * re-installed whenever alphaTab rebuilds its player. Returns a function that unbinds everything.
 */
export function bindExternalMedia(
    api: AlphaTabApi,
    media: MediaElementLike,
    target: ExternalMediaTarget = {
        play: () => api.play(),
        pause: () => api.pause(),
        setMasterVolume: (v) => { api.masterVolume = v; },
        setPlaybackSpeed: (v) => { api.playbackSpeed = v; },
    },
): () => void {
    const handler: synth.IExternalMediaHandler = {
        get backingTrackDuration() {
            const duration = media.duration;
            return Number.isFinite(duration) && duration > 0 ? duration * 1000 : 0;
        },
        get playbackRate() {
            return media.playbackRate;
        },
        set playbackRate(value) {
            media.playbackRate = value;
        },
        get masterVolume() {
            return media.volume;
        },
        set masterVolume(value) {
            media.volume = value;
        },
        seekTo(time) {
            media.currentTime = time / 1000;
        },
        play() {
            media.play();
        },
        pause() {
            media.pause();
        },
    };

    const output = (): synth.IExternalMediaSynthOutput | null => {
        const current = api.player?.output;
        return isExternalMediaOutput(current) ? current : null;
    };

    const install = () => {
        const current = output();
        if (current && current.handler !== handler) { current.handler = handler; }
    };

    let frame = 0;
    const reportPosition = () => {
        output()?.updatePosition(media.currentTime * 1000);
    };
    const tick = () => {
        reportPosition();
        frame = requestAnimationFrame(tick);
    };
    const stopTicking = () => {
        cancelAnimationFrame(frame);
        frame = 0;
    };

    const onPlay = () => {
        target.play();
        if (!frame) { frame = requestAnimationFrame(tick); }
    };
    const onPause = () => {
        stopTicking();
        reportPosition();
        target.pause();
    };
    const onVolumeChange = () => target.setMasterVolume(media.volume);
    const onRateChange = () => target.setPlaybackSpeed(media.playbackRate);

    media.addEventListener('timeupdate', reportPosition);
    media.addEventListener('seeked', reportPosition);
    media.addEventListener('play', onPlay);
    media.addEventListener('pause', onPause);
    media.addEventListener('ended', onPause);
    media.addEventListener('volumechange', onVolumeChange);
    media.addEventListener('ratechange', onRateChange);
    const offReady = api.playerReady.on(install);
    const offMidiLoad = api.midiLoad.on(install);
    install();
    if (!media.paused) { onPlay(); }

    return () => {
        stopTicking();
        media.removeEventListener('timeupdate', reportPosition);
        media.removeEventListener('seeked', reportPosition);
        media.removeEventListener('play', onPlay);
        media.removeEventListener('pause', onPause);
        media.removeEventListener('ended', onPause);
        media.removeEventListener('volumechange', onVolumeChange);
        media.removeEventListener('ratechange', onRateChange);
        offReady();
        offMidiLoad();
        const current = output();
        if (current?.handler === handler) { current.handler = undefined; }
    };
}
