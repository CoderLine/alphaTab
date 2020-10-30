import { ISynthOutput } from '@src/synth/ISynthOutput';
import { EventEmitter, IEventEmitter, IEventEmitterOfT, EventEmitterOfT } from '@src/EventEmitter';
import { IWorkerScope } from '@src/platform/javascript/IWorkerScope';
import { Logger } from '@src/Logger';
import { Environment } from '@src/Environment';

/**
 * @target web
 */
export class AlphaSynthWorkerSynthOutput implements ISynthOutput {
    public static readonly CmdOutputPrefix: string = 'alphaSynth.output.';
    public static readonly CmdOutputAddSamples: string = AlphaSynthWorkerSynthOutput.CmdOutputPrefix + 'addSamples';
    public static readonly CmdOutputPlay: string = AlphaSynthWorkerSynthOutput.CmdOutputPrefix + 'play';
    public static readonly CmdOutputPause: string = AlphaSynthWorkerSynthOutput.CmdOutputPrefix + 'pause';
    public static readonly CmdOutputResetSamples: string = AlphaSynthWorkerSynthOutput.CmdOutputPrefix + 'resetSamples';
    public static readonly CmdOutputSampleRequest: string =
        AlphaSynthWorkerSynthOutput.CmdOutputPrefix + 'sampleRequest';
    public static readonly CmdOutputSamplesPlayed: string =
        AlphaSynthWorkerSynthOutput.CmdOutputPrefix + 'samplesPlayed';

    // this value is initialized by the alphaSynth WebWorker wrapper
    // that also includes the alphaSynth library into the worker.
    public static preferredSampleRate: number = 0;

    private _worker!: IWorkerScope;

    public get sampleRate(): number {
        return AlphaSynthWorkerSynthOutput.preferredSampleRate;
    }

    public open(): void {
        Logger.debug('AlphaSynth', 'Initializing webworker worker');
        this._worker = Environment.globalThis as IWorkerScope;
        this._worker.addEventListener('message', this.handleMessage.bind(this));
        (this.ready as EventEmitter).trigger();
    }

    private handleMessage(e: MessageEvent): void {
        let data: any = e.data;
        let cmd: any = data.cmd;
        switch (cmd) {
            case AlphaSynthWorkerSynthOutput.CmdOutputSampleRequest:
                (this.sampleRequest as EventEmitter).trigger();
                break;
            case AlphaSynthWorkerSynthOutput.CmdOutputSamplesPlayed:
                (this.samplesPlayed as EventEmitterOfT<number>).trigger(data.samples);
                break;
        }
    }

    public readonly ready: IEventEmitter = new EventEmitter();
    public readonly samplesPlayed: IEventEmitterOfT<number> = new EventEmitterOfT<number>();
    public readonly sampleRequest: IEventEmitter = new EventEmitter();

    public addSamples(samples: Float32Array): void {
        this._worker.postMessage({
            cmd: 'alphaSynth.output.addSamples',
            samples: samples
        });
    }

    public play(): void {
        this._worker.postMessage({
            cmd: 'alphaSynth.output.play'
        });
    }

    public pause(): void {
        this._worker.postMessage({
            cmd: 'alphaSynth.output.pause'
        });
    }

    public resetSamples(): void {
        this._worker.postMessage({
            cmd: 'alphaSynth.output.resetSamples'
        });
    }

    public activate(): void {
        // nothing to do
    }
}
