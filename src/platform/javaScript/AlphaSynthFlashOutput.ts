import { ISynthOutput } from '@src/audio/synth/ISynthOutput';
import { EventEmitter } from '@src/EventEmitter';
import { IFlashSynthOutput } from '@src/platform/javaScript/IFlashSynthOutput';
import { Logger } from '@src/util/Logger';

export class AlphaSynthFlashOutput implements ISynthOutput {
    private static readonly Id: string = 'alphaSynthFlashPlayer';
    private static readonly PreferredSampleRate: number = 44100;

    private static Lookup: Map<string, AlphaSynthFlashOutput> = new Map<string, AlphaSynthFlashOutput>();
    private static NextId: number = 0;

    private _alphaSynthRoot: string;
    private _id!: string;
    private _swfId!: string;
    private _swfContainer!: HTMLElement;

    public get sampleRate(): number {
        return AlphaSynthFlashOutput.PreferredSampleRate;
    }

    public constructor(alphaSynthRoot: string) {
        this._alphaSynthRoot = alphaSynthRoot;
        let lastSlash: number = this._alphaSynthRoot.lastIndexOf('/');
        if (lastSlash !== -1) {
            this._alphaSynthRoot = this._alphaSynthRoot.substr(0, lastSlash + 1);
        }
    }

    public open(): void {
        this._id = AlphaSynthFlashOutput.Id + AlphaSynthFlashOutput.NextId;
        this._swfId = this._id + 'swf';
        AlphaSynthFlashOutput.Lookup.set(this._id, this);
        AlphaSynthFlashOutput.NextId++;
        this._swfContainer = document.createElement('div');
        this._swfContainer.className = AlphaSynthFlashOutput.Id;
        this._swfContainer.setAttribute('id', this._id);
        document.body.appendChild(this._swfContainer);
        let swf: any = (window as any)['swfobject'];
        if (swf) {
            swf.embedSWF(
                this._alphaSynthRoot + 'AlphaSynth.FlashOutput.swf',
                this._id,
                '1px',
                '1px',
                '9.0.0',
                null,
                {
                    id: this._id,
                    sampleRate: 44100
                },
                {
                    allowScriptAccess: 'always'
                },
                {
                    id: this._swfId
                }
            );
        } else {
            Logger.error('Player', 'swfobject not found, player will not work', null);
        }
    }

    private get flashOutput(): IFlashSynthOutput {
        let element: HTMLElement | null = document.getElementById(this._swfId);
        return element as any;
    }

    public play(): void {
        this.flashOutput.alphaSynthPlay();
    }

    public pause(): void {
        this.flashOutput.alphaSynthPause();
    }

    public sequencerFinished(): void {
        this.flashOutput.alphaSynthSequencerFinished();
    }

    public addSamples(samples: Float32Array): void {
        let uint8: Uint8Array = new Uint8Array(samples.buffer);
        let b64: string = window.btoa(String.fromCharCode.apply(null, uint8 as any));
        this.flashOutput.alphaSynthAddSamples(b64);
    }

    public resetSamples() {
        this.flashOutput.alphaSynthResetSamples();
    }

    public readonly ready: EventEmitter<() => void> = new EventEmitter();

    public static onReady(id: string): void {
        if (AlphaSynthFlashOutput.Lookup.has(id)) {
            AlphaSynthFlashOutput.Lookup.get(id)!.ready.trigger();
        }
    }

    public readonly samplesPlayed: EventEmitter<(count: number) => void> = new EventEmitter();

    public static onSamplesPlayed(id: string, samples: number): void {
        if (AlphaSynthFlashOutput.Lookup.has(id)) {
            AlphaSynthFlashOutput.Lookup.get(id)!.samplesPlayed.trigger(samples);
        }
    }

    public readonly sampleRequest: EventEmitter<() => void> = new EventEmitter();

    public static onSampleRequest(id: string): void {
        if (AlphaSynthFlashOutput.Lookup.has(id)) {
            AlphaSynthFlashOutput.Lookup.get(id)!.sampleRequest.trigger();
        }
    }

    public readonly finished: EventEmitter<() => void> = new EventEmitter();

    public static onFinished(id: string): void {
        if (AlphaSynthFlashOutput.Lookup.has(id) && AlphaSynthFlashOutput.Lookup.get(id)!.finished) {
            AlphaSynthFlashOutput.Lookup.get(id)!.finished.trigger();
        }
    }

    public activate(): void {}
}
