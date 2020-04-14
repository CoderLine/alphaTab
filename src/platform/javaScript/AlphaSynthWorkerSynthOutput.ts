import { ISynthOutput } from '@src/audio/synth/ISynthOutput';
import { EventEmitter } from '@src/EventEmitter';
import { IWorkerScope } from '@src/platform/javaScript/IWorkerScope';
import { Logger } from '@src/util/Logger';

export class AlphaSynthWorkerSynthOutput implements ISynthOutput {
    public static readonly CmdOutputPrefix: string = 'alphaSynth.output.';
    public static readonly CmdOutputSequencerFinished: string =
        AlphaSynthWorkerSynthOutput.CmdOutputPrefix + 'sequencerFinished';
    public static readonly CmdOutputAddSamples: string = AlphaSynthWorkerSynthOutput.CmdOutputPrefix + 'addSamples';
    public static readonly CmdOutputPlay: string = AlphaSynthWorkerSynthOutput.CmdOutputPrefix + 'play';
    public static readonly CmdOutputPause: string = AlphaSynthWorkerSynthOutput.CmdOutputPrefix + 'pause';
    public static readonly CmdOutputResetSamples: string = AlphaSynthWorkerSynthOutput.CmdOutputPrefix + 'resetSamples';
    public static readonly CmdOutputSampleRequest: string =
        AlphaSynthWorkerSynthOutput.CmdOutputPrefix + 'sampleRequest';
    public static readonly CmdOutputFinished: string = AlphaSynthWorkerSynthOutput.CmdOutputPrefix + 'finished';
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
        this._worker = (globalThis as unknown) as IWorkerScope;
        this._worker.addEventListener('message', this.handleMessage.bind(this));
        this.ready.trigger();
    }

    private handleMessage(e: MessageEvent): void {
        let data: any = e.data;
        let cmd: any = data.cmd;
        switch (cmd) {
            case AlphaSynthWorkerSynthOutput.CmdOutputSampleRequest:
                this.sampleRequest.trigger();
                break;
            case AlphaSynthWorkerSynthOutput.CmdOutputFinished:
                this.finished.trigger();
                break;
            case AlphaSynthWorkerSynthOutput.CmdOutputSamplesPlayed:
                this.samplesPlayed.trigger(data.samples);
                break;
        }
    }

    public readonly ready: EventEmitter<() => void> = new EventEmitter();
    public readonly samplesPlayed: EventEmitter<(count: number) => void> = new EventEmitter();
    public readonly sampleRequest: EventEmitter<() => void> = new EventEmitter();
    public readonly finished: EventEmitter<() => void> = new EventEmitter();

    public sequencerFinished(): void {
        this._worker.postMessage({
            cmd: 'alphaSynth.output.sequencerFinished'
        });
    }

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
