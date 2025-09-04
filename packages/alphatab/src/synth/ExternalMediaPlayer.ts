import { EventEmitter, EventEmitterOfT, type IEventEmitter, type IEventEmitterOfT } from '@src/EventEmitter';
import type { BackingTrack } from '@src/model/BackingTrack';
import { type IBackingTrackSynthOutput, BackingTrackPlayer } from '@src/synth/BackingTrackPlayer';
import type { ISynthOutputDevice } from '@src/synth/ISynthOutput';

/**
 * A custom handler for integrating alphaTab with an external media source.
 */
export interface IExternalMediaHandler {
    /**
     * The total duration of the backing track in milliseconds.
     */
    readonly backingTrackDuration: number;
    /**
     * The playback rate at which the output should playback.
     */
    playbackRate: number;
    /**
     * The volume at which the output should play (0-1)
     */
    masterVolume: number;
    /**
     * Instructs the output to seek to the given time position.
     * @param time The absolute time in milliseconds.
     */
    seekTo(time: number): void;

    /**
     * Instructs the external media to start the playback.
     */
    play(): void;
    /**
     * Instructs the external media to pause the playback.
     */
    pause(): void;
}

/**
 * A output handling the playback via an external media.
 */
export interface IExternalMediaSynthOutput extends IBackingTrackSynthOutput {
    /**
     * The handler to which the media control will be delegated.
     */
    handler: IExternalMediaHandler | undefined;
    /**
     * Updates the playback position from the external media source.
     * @param currentTime The current time in the external media.
     */
    updatePosition(currentTime: number): void;
}

class ExternalMediaSynthOutput implements IExternalMediaSynthOutput {
    // fake rate
    public readonly sampleRate: number = 44100;

    private _seekPosition: number = 0;

    private _handler?: IExternalMediaHandler;

    public get handler(): IExternalMediaHandler | undefined {
        return this._handler;
    }

    public set handler(value: IExternalMediaHandler | undefined) {
        if (value) {
            if (this._seekPosition !== 0) {
                value.seekTo(this._seekPosition);
                this._seekPosition = 0;
            }
        }

        this._handler = value;
    }

    public get backingTrackDuration() {
        return this.handler?.backingTrackDuration ?? 0;
    }

    public get playbackRate(): number {
        return this.handler?.playbackRate ?? 1;
    }

    public set playbackRate(value: number) {
        const handler = this.handler;
        if (handler) {
            handler.playbackRate = value;
        }
    }

    public get masterVolume(): number {
        return this.handler?.masterVolume ?? 1;
    }

    public set masterVolume(value: number) {
        const handler = this.handler;
        if (handler) {
            handler.masterVolume = value;
        }
    }

    public seekTo(time: number): void {
        const handler = this.handler;
        if (handler) {
            handler.seekTo(time);
        } else {
            this._seekPosition = time;
        }
    }

    public loadBackingTrack(_backingTrack: BackingTrack) {}

    public open(_bufferTimeInMilliseconds: number): void {
        (this.ready as EventEmitter).trigger();
    }

    public updatePosition(currentTime: number) {
        (this.timeUpdate as EventEmitterOfT<number>).trigger(currentTime);
    }

    public play(): void {
        this.handler?.play();
    }
    public destroy(): void {}

    public pause(): void {
        this.handler?.pause();
    }

    public addSamples(_samples: Float32Array): void {}
    public resetSamples(): void {}
    public activate(): void {}

    public readonly ready: IEventEmitter = new EventEmitter();
    public readonly samplesPlayed: IEventEmitterOfT<number> = new EventEmitterOfT<number>();
    public readonly timeUpdate: IEventEmitterOfT<number> = new EventEmitterOfT<number>();
    public readonly sampleRequest: IEventEmitter = new EventEmitter();

    public async enumerateOutputDevices(): Promise<ISynthOutputDevice[]> {
        const empty: ISynthOutputDevice[] = [];
        return empty;
    }
    public async setOutputDevice(_device: ISynthOutputDevice | null): Promise<void> {}

    public async getOutputDevice(): Promise<ISynthOutputDevice | null> {
        return null;
    }
}

export class ExternalMediaPlayer extends BackingTrackPlayer {
    public get handler(): IExternalMediaHandler | undefined {
        return (this.output as ExternalMediaSynthOutput).handler;
    }

    public set handler(value: IExternalMediaHandler | undefined) {
        (this.output as ExternalMediaSynthOutput).handler = value;
    }

    constructor(bufferTimeInMilliseconds: number) {
        super(new ExternalMediaSynthOutput(), bufferTimeInMilliseconds);
    }
}
