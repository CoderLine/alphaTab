import { CircularSampleBuffer } from '@src/synth/ds/CircularSampleBuffer';
import { ISynthOutput } from '@src/synth/ISynthOutput';
import { EventEmitter, IEventEmitterOfT, IEventEmitter, EventEmitterOfT } from '@src/EventEmitter';
import { Environment } from '@src/Environment';
import { AlphaTabError, AlphaTabErrorType } from '@src/AlphaTabError';
import { Logger } from '@src/Logger';

declare var webkitAudioContext: any;

/**
 * This class implements a HTML5 Web Audio API based audio output device
 * for alphaSynth. It can be controlled via a JS API.
 * @target web
 */
export class AlphaSynthWebAudioOutput implements ISynthOutput {
    private static readonly BufferSize: number = 4096;
    private static readonly PreferredSampleRate: number = 44100;
    private static readonly TotalBufferTimeInMilliseconds: number = 5000;

    private _context: AudioContext | null = null;
    private _buffer: AudioBuffer | null = null;
    private _source: AudioBufferSourceNode | null = null;
    private _audioNode: ScriptProcessorNode | null = null;
    private _circularBuffer!: CircularSampleBuffer;
    private _bufferCount: number = 0;
    private _requestedBufferCount: number = 0;

    public get sampleRate(): number {
        return this._context ? this._context.sampleRate : AlphaSynthWebAudioOutput.PreferredSampleRate;
    }

    public open(): void {
        this.patchIosSampleRate();
        this._context = this.createAudioContext();
        this._bufferCount = Math.floor(
            (AlphaSynthWebAudioOutput.TotalBufferTimeInMilliseconds * this.sampleRate) /
            1000 /
            AlphaSynthWebAudioOutput.BufferSize
        );
        this._circularBuffer = new CircularSampleBuffer(AlphaSynthWebAudioOutput.BufferSize * this._bufferCount);
        let ctx: AudioContext = this._context;
        if (ctx.state === 'suspended') {
            Logger.debug('WebAudio', 'Audio Context is suspended');
            let resume = () => {
                this.activate();
                Environment.globalThis.setTimeout(() => {
                    if (ctx.state === 'running') {
                        document.body.removeEventListener('touchend', resume, false);
                        document.body.removeEventListener('click', resume, false);
                    }
                }, 0);
            };
            document.body.addEventListener('touchend', resume, false);
            document.body.addEventListener('click', resume, false);
        }
        (this.ready as EventEmitter).trigger();
    }

    public activate(): void {
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
                },
                reason => {
                    Logger.debug(
                        'WebAudio',
                        `Audio Context resume failed: state=${this._context?.state}, sampleRate:${this._context?.sampleRate}, reason=${reason}`
                    );
                }
            );
        }
    }

    private patchIosSampleRate(): void {
        let ua: string = navigator.userAgent;
        if (ua.indexOf('iPhone') !== -1 || ua.indexOf('iPad') !== 0) {
            let context: AudioContext = this.createAudioContext();
            let buffer: AudioBuffer = context.createBuffer(1, 1, AlphaSynthWebAudioOutput.PreferredSampleRate);
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
            return new AudioContext({
                sampleRate: AlphaSynthWebAudioOutput.PreferredSampleRate
            });
        } else if ('webkitAudioContext' in Environment.globalThis) {
            return new webkitAudioContext({
                sampleRate: AlphaSynthWebAudioOutput.PreferredSampleRate
            });
        }
        throw new AlphaTabError(AlphaTabErrorType.General, 'AudioContext not found');
    }

    public play(): void {
        let ctx = this._context;
        if (!ctx) {
            return;
        }
        this.activate();
        // create an empty buffer source (silence)
        this._buffer = ctx.createBuffer(2, AlphaSynthWebAudioOutput.BufferSize, ctx.sampleRate);
        // create a script processor node which will replace the silence with the generated audio
        this._audioNode = ctx.createScriptProcessor(AlphaSynthWebAudioOutput.BufferSize, 0, 2);
        this._audioNode.onaudioprocess = this.generateSound.bind(this);
        this._circularBuffer.clear();

        this.requestBuffers();

        this._source = ctx.createBufferSource();
        this._source.buffer = this._buffer;
        this._source.loop = true;
        this._source.connect(this._audioNode, 0, 0);
        this._source.start(0);
        this._audioNode.connect(ctx.destination, 0, 0);
    }

    public pause(): void {
        if (this._source) {
            this._source.stop(0);
            this._source.disconnect(0);
        }
        this._source = null;
        if (this._audioNode) {
            this._audioNode.disconnect(0);
        }
        this._audioNode = null;
    }

    public destroy(): void {
        this.pause();
        this._context?.close();
    }

    public addSamples(f: Float32Array): void {
        this._circularBuffer.write(f, 0, f.length);
        this._requestedBufferCount--;
    }

    public resetSamples(): void {
        this._circularBuffer.clear();
    }

    private requestBuffers(): void {
        // if we fall under the half of buffers
        // we request one half
        const halfBufferCount = (this._bufferCount / 2) | 0;
        let halfSamples: number = halfBufferCount * AlphaSynthWebAudioOutput.BufferSize;
        // Issue #631: it can happen that requestBuffers is called multiple times
        // before we already get samples via addSamples, therefore we need to
        // remember how many buffers have been requested, and consider them as available.
        let bufferedSamples = this._circularBuffer.count + this._requestedBufferCount * AlphaSynthWebAudioOutput.BufferSize;
        if (bufferedSamples < halfSamples) {
            for (let i: number = 0; i < halfBufferCount; i++) {
                (this.sampleRequest as EventEmitter).trigger();
            }
            this._requestedBufferCount += halfBufferCount;
        }
    }

    private _outputBuffer: Float32Array = new Float32Array(0);
    private generateSound(e: AudioProcessingEvent): void {
        let left: Float32Array = e.outputBuffer.getChannelData(0);
        let right: Float32Array = e.outputBuffer.getChannelData(1);
        let samples: number = left.length + right.length;
        let buffer = this._outputBuffer;
        if (buffer.length !== samples) {
            buffer = new Float32Array(samples);
            this._outputBuffer = buffer;
        }
        this._circularBuffer.read(buffer, 0, Math.min(buffer.length, this._circularBuffer.count));
        let s: number = 0;
        for (let i: number = 0; i < left.length; i++) {
            left[i] = buffer[s++];
            right[i] = buffer[s++];
        }
        (this.samplesPlayed as EventEmitterOfT<number>).trigger(left.length);
        this.requestBuffers();
    }

    readonly ready: IEventEmitter = new EventEmitter();
    readonly samplesPlayed: IEventEmitterOfT<number> = new EventEmitterOfT<number>();
    readonly sampleRequest: IEventEmitter = new EventEmitter();
}
