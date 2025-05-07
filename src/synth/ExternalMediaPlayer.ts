import { EventEmitter, EventEmitterOfT, type IEventEmitter, type IEventEmitterOfT } from '@src/EventEmitter';
import type { BackingTrack } from '@src/model/BackingTrack';
import { type IBackingTrackSynthOutput, BackingTrackPlayer } from '@src/synth/BackingTrackPlayer';
import type { ISynthOutputDevice } from '@src/synth/ISynthOutput';

class ExternalMediaSynthOutput implements IBackingTrackSynthOutput {
    // fake rate
    public readonly sampleRate: number = 44100;

    public backingTrackDuration: number = 0;
    public playbackRate: number = 1;

    public seekTo(time: number): void {}

    public loadBackingTrack(backingTrack: BackingTrack) {}

    public open(_bufferTimeInMilliseconds: number): void {
        (this.ready as EventEmitter).trigger();
    }

    public updatePosition(currentTime: number) {
        (this.timeUpdate as EventEmitterOfT<number>).trigger(currentTime);
    }

    public play(): void {}
    public destroy(): void {}

    public pause(): void {}

    public addSamples(_samples: Float32Array): void {
        // nobody will call this
    }
    public resetSamples(): void {
        // nobody will call this
    }
    public activate(): void {
        // nobody will call this
    }

    public readonly ready: IEventEmitter = new EventEmitter();
    public readonly samplesPlayed: IEventEmitterOfT<number> = new EventEmitterOfT<number>();
    public readonly timeUpdate: IEventEmitterOfT<number> = new EventEmitterOfT<number>();
    public readonly sampleRequest: IEventEmitter = new EventEmitter();

    public async enumerateOutputDevices(): Promise<ISynthOutputDevice[]> {
        const empty:ISynthOutputDevice[] = [];
        return empty;
    }
    public async setOutputDevice(_device: ISynthOutputDevice | null): Promise<void> {}

    public async getOutputDevice(): Promise<ISynthOutputDevice | null> {
        return null;
    }
}

export class ExternalMediaPlayer extends BackingTrackPlayer {
    constructor(bufferTimeInMilliseconds: number) {
        super(new ExternalMediaSynthOutput(), bufferTimeInMilliseconds);
    }
}
