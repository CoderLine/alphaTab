import type { ISynthOutput, ISynthOutputDevice } from '@src/synth/ISynthOutput';
import { EventEmitter, type IEventEmitter, type IEventEmitterOfT, EventEmitterOfT } from '@src/EventEmitter';

export class TestOutput implements ISynthOutput {
    public samples: number[] = [];

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
        for (let i: number = 0; i < f.length; i++) {
            this.samples.push(f[i]);
        }
        (this.samplesPlayed as EventEmitterOfT<number>).trigger(f.length);
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
