import { Environment } from '@coderline/alphatab/Environment';
import {
    EventEmitter,
    EventEmitterOfT,
    type IEventEmitter,
    type IEventEmitterOfT
} from '@coderline/alphatab/EventEmitter';
import { Logger } from '@coderline/alphatab/Logger';
import type {
    IAlphaSynthWorkerMessage,
    IAlphaTabWorkerGlobalScope
} from '@coderline/alphatab/platform/worker/AlphaTabWorkerProtocol';
import type { ISynthOutput, ISynthOutputDevice } from '@coderline/alphatab/synth/ISynthOutput';

/**
 * @internal
 */
export class AlphaSynthWorkerSynthOutput implements ISynthOutput {
    // this value is initialized by the alphaSynth WebWorker wrapper
    // that also includes the alphaSynth library into the worker.
    public static preferredSampleRate: number = 0;

    private _main: IAlphaTabWorkerGlobalScope<IAlphaSynthWorkerMessage>;

    public get sampleRate(): number {
        return AlphaSynthWorkerSynthOutput.preferredSampleRate;
    }

    public constructor(main: IAlphaTabWorkerGlobalScope<IAlphaSynthWorkerMessage>) {
        this._main = main;
    }

    public open(_sampleRate: number): void {
        Logger.debug('AlphaSynth', 'Initializing synth worker');
        this._main.addEventListener('message', this._handleMessage.bind(this));
        (this.ready as EventEmitter).trigger();
    }

    public destroy(): void {
        this._main.postMessage({
            cmd: 'alphaSynth.output.destroy'
        });
    }

    private _handleMessage(e: MessageEvent<IAlphaSynthWorkerMessage>): void {
        const data = e.data;
        switch (data.cmd) {
            case 'alphaSynth.output.sampleRequest':
                (this.sampleRequest as EventEmitter).trigger();
                break;
            case 'alphaSynth.output.samplesPlayed':
                (this.samplesPlayed as EventEmitterOfT<number>).trigger(data.samples);
                break;
        }
    }

    public readonly ready: IEventEmitter = new EventEmitter();
    public readonly samplesPlayed: IEventEmitterOfT<number> = new EventEmitterOfT<number>();
    public readonly sampleRequest: IEventEmitter = new EventEmitter();

    public addSamples(samples: Float32Array): void {
        this._main.postMessage({
            cmd: 'alphaSynth.output.addSamples',
            samples: Environment.prepareForPostMessage(samples)
        });
    }

    public play(): void {
        this._main.postMessage({
            cmd: 'alphaSynth.output.play'
        });
    }

    public pause(): void {
        this._main.postMessage({
            cmd: 'alphaSynth.output.pause'
        });
    }

    public resetSamples(): void {
        this._main.postMessage({
            cmd: 'alphaSynth.output.resetSamples'
        });
    }

    public activate(): void {
        // nothing to do
    }

    public async enumerateOutputDevices(): Promise<ISynthOutputDevice[]> {
        return [] as ISynthOutputDevice[];
    }
    public async setOutputDevice(_device: ISynthOutputDevice | null): Promise<void> {}
    public async getOutputDevice(): Promise<ISynthOutputDevice | null> {
        return null;
    }
}
