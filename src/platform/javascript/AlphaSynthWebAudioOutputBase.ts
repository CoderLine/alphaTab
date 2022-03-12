import { AlphaTabError, AlphaTabErrorType } from '@src/AlphaTabError';
import { Environment } from '@src/Environment';
import { EventEmitter, EventEmitterOfT, IEventEmitter, IEventEmitterOfT } from '@src/EventEmitter';
import { Logger } from '@src/Logger';
import { ISynthOutput } from '@src/synth/ISynthOutput';

declare var webkitAudioContext: any;

/**
 * @target web
 */
export abstract class AlphaSynthWebAudioOutputBase implements ISynthOutput {
    protected static readonly BufferSize: number = 4096;
    protected static readonly PreferredSampleRate: number = 44100;

    protected _context: AudioContext | null = null;
    protected _buffer: AudioBuffer | null = null;
    protected _source: AudioBufferSourceNode | null = null;

    private _resumeHandler?: () => void;

    public get sampleRate(): number {
        return this._context ? this._context.sampleRate : AlphaSynthWebAudioOutputBase.PreferredSampleRate;
    }

    public activate(resumedCallback?: () => void): void {
        if (!this._context) {
            this._context = this.createAudioContext();
        }

        if (this._context.state === 'suspended' || (this._context.state as string) === 'interrupted') {
            Logger.debug('WebAudio', 'Audio Context is suspended, trying resume');
            this._context.resume().then(
                () => {
                    Logger.debug(
                        'WebAudio',
                        `Audio Context resume success: state=${this._context?.state}, sampleRate:${this._context?.sampleRate}`
                    );
                    if (resumedCallback) {
                        resumedCallback();
                    }
                },
                reason => {
                    Logger.warning(
                        'WebAudio',
                        `Audio Context resume failed: state=${this._context?.state}, sampleRate:${this._context?.sampleRate}, reason=${reason}`
                    );
                }
            );
        }
    }

    private patchIosSampleRate(): void {
        let ua: string = navigator.userAgent;
        if (ua.indexOf('iPhone') !== -1 || ua.indexOf('iPad') !== -1) {
            let context: AudioContext = this.createAudioContext();
            let buffer: AudioBuffer = context.createBuffer(1, 1, AlphaSynthWebAudioOutputBase.PreferredSampleRate);
            let dummy: AudioBufferSourceNode = context.createBufferSource();
            dummy.buffer = buffer;
            dummy.connect(context.destination);
            dummy.start(0);
            dummy.disconnect(0);
            // tslint:disable-next-line: no-floating-promises
            context.close();
        }
    }

    private createAudioContext(): AudioContext {
        if ('AudioContext' in Environment.globalThis) {
            return new AudioContext();
        } else if ('webkitAudioContext' in Environment.globalThis) {
            return new webkitAudioContext();
        }
        throw new AlphaTabError(AlphaTabErrorType.General, 'AudioContext not found');
    }

    public open(bufferTimeInMilliseconds: number): void {
        this.patchIosSampleRate();
        this._context = this.createAudioContext();
        let ctx: any = this._context;
        if (ctx.state === 'suspended') {
            this.registerResumeHandler();
        }
    }

    private registerResumeHandler() {
        this._resumeHandler = (() => {
            this.activate(() => {
                this.unregisterResumeHandler();
            });
        }).bind(this);
        document.body.addEventListener('touchend', this._resumeHandler, false);
        document.body.addEventListener('click', this._resumeHandler, false);
    }

    private unregisterResumeHandler() {
        const resumeHandler = this._resumeHandler;
        if (resumeHandler) {
            document.body.removeEventListener('touchend', resumeHandler, false);
            document.body.removeEventListener('click', resumeHandler, false);
        }
    }

    public play(): void {
        let ctx = this._context!;
        this.activate();
        // create an empty buffer source (silence)
        this._buffer = ctx.createBuffer(2, AlphaSynthWebAudioOutputBase.BufferSize, ctx.sampleRate);
        this._source = ctx.createBufferSource();
        this._source.buffer = this._buffer;
        this._source.loop = true;
    }

    public pause(): void {
        if (this._source) {
            this._source.stop(0);
            this._source.disconnect();
        }
        this._source = null;
    }

    public destroy(): void {
        this.pause();
        this._context?.close();
        this._context = null;
        this.unregisterResumeHandler();
    }

    public abstract addSamples(f: Float32Array): void;
    public abstract resetSamples(): void;

    public readonly ready: IEventEmitter = new EventEmitter();
    public readonly samplesPlayed: IEventEmitterOfT<number> = new EventEmitterOfT<number>();
    public readonly sampleRequest: IEventEmitter = new EventEmitter();

    protected onSamplesPlayed(numberOfSamples: number) {
        (this.samplesPlayed as EventEmitterOfT<number>).trigger(numberOfSamples);
    }

    protected onSampleRequest() {
        (this.sampleRequest as EventEmitter).trigger();
    }

    protected onReady() {
        (this.ready as EventEmitter).trigger();
    }
}
