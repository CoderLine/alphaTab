import type { ISynthOutput, ISynthOutputDevice } from '@src/synth/ISynthOutput';
import { EventEmitter, type IEventEmitter, type IEventEmitterOfT, EventEmitterOfT } from '@src/EventEmitter';
import { SynthConstants } from '@src/synth/SynthConstants';

export class TestOutput implements ISynthOutput {
    public samples: Float32Array[] = [];
    public sampleCount: number = 0;

    public get sampleRate(): number {
        return 44100;
    }

    public open(bufferTimeInMilliseconds: number): void {
        this.samples = [];
        (this.ready as EventEmitter).trigger();
    }

    public play(): void {
        // nothing to do
    }

    public destroy(): void {
        // nothing to do
    }

    public next(): void {
        (this.sampleRequest as EventEmitter).trigger();
    }

    public pause(): void {
        // nothing to do
    }

    public addSamples(f: Float32Array): void {
        this.samples.push(f);
        this.sampleCount += f.length;
        (this.samplesPlayed as EventEmitterOfT<number>).trigger(f.length / SynthConstants.AudioChannels);
    }

    public resetSamples(): void {
        // nothing to do
    }

    public activate(): void {
        // nothing to do
    }

    /**
     * Fired when the output has been successfully opened and is ready to play samples.
     */
    readonly ready: IEventEmitter = new EventEmitter();

    /**
     * Fired when a certain number of samples have been played.
     */
    readonly samplesPlayed: IEventEmitterOfT<number> = new EventEmitterOfT<number>();

    /**
     * Fired when the output needs more samples to be played.
     */
    readonly sampleRequest: IEventEmitter = new EventEmitter();

    public async enumerateOutputDevices(): Promise<ISynthOutputDevice[]> {
        return [] as ISynthOutputDevice[];
    }
    public async setOutputDevice(device: ISynthOutputDevice | null): Promise<void> {}
    public async getOutputDevice(): Promise<ISynthOutputDevice | null> {
        return null;
    }
}
