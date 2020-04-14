import { ISynthOutput } from '@src/audio/synth/ISynthOutput';
import { EventEmitter } from '@src/EventEmitter';

export class TestOutput implements ISynthOutput {
    private _finished: boolean = false;
    public samples: number[] = [];

    public get sampleRate(): number {
        return 44100;
    }

    public open(): void {
        this.samples = [];
        this.ready.trigger();
    }

    public sequencerFinished(): void {
        this._finished = true;
    }

    public play(): void {
        // nothing to do
    }

    public next(): void {
        if (this._finished) {
            this.finished.trigger();
        } else {
            this.sampleRequest.trigger();
        }
    }

    public pause(): void {
        // nothing to do
    }

    public addSamples(f: Float32Array): void {
        for (let i: number = 0; i < f.length; i++) {
            this.samples.push(f[i]);
        }
        this.samplesPlayed.trigger(f.length);
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
    readonly ready: EventEmitter<() => void> = new EventEmitter();

    /**
     * Fired when a certain number of samples have been played.
     */
    readonly samplesPlayed: EventEmitter<(count: number) => void> = new EventEmitter();

    /**
     * Fired when the output needs more samples to be played.
     */
    readonly sampleRequest: EventEmitter<() => void> = new EventEmitter();

    /**
     * Fired when the last samples after calling SequencerFinished have been played.
     */
    readonly finished: EventEmitter<() => void> = new EventEmitter();
}
