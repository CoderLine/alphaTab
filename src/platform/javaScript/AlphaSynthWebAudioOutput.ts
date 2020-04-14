import { CircularSampleBuffer } from '@src/audio/synth/ds/CircularSampleBuffer';
import { ISynthOutput } from '@src/audio/synth/ISynthOutput';
import { EventEmitter } from '@src/EventEmitter';

/**
 * This class implements a HTML5 Web Audio API based audio output device
 * for alphaSynth. It can be controlled via a JS API.
 */
export class AlphaSynthWebAudioOutput implements ISynthOutput {
    private static readonly BufferSize: number = 4096;
    private static readonly BufferCount: number = 10;
    private static readonly PreferredSampleRate: number = 44100;

    private _context: AudioContext | null = null;
    private _buffer: AudioBuffer | null = null;
    private _source: AudioBufferSourceNode | null = null;
    private _audioNode: ScriptProcessorNode | null = null;
    private _circularBuffer!: CircularSampleBuffer;
    private _finished: boolean = false;

    public get sampleRate(): number {
        return this._context ? this._context.sampleRate : AlphaSynthWebAudioOutput.PreferredSampleRate;
    }

    public open(): void {
        this._finished = false;
        this.patchIosSampleRate();
        this._circularBuffer = new CircularSampleBuffer(
            AlphaSynthWebAudioOutput.BufferSize * AlphaSynthWebAudioOutput.BufferCount
        );
        this._context = new AudioContext();
        // possible fix for Web Audio in iOS 9 (issue #4)
        let ctx: any = this._context;
        if (ctx.state === 'suspended') {
            let resume = () => {
                ctx.resume();
                window.setTimeout(() => {
                    if (ctx.state === 'running') {
                        document.body.removeEventListener('touchend', resume, false);
                        document.body.removeEventListener('click', resume, false);
                    }
                }, 0);
            };
            document.body.addEventListener('touchend', resume, false);
            document.body.addEventListener('click', resume, false);
        }
        this.ready.trigger();
    }

    public activate(): void {
        if (this._context) {
            let ctx: any = this._context;
            ctx.resume();
        }
    }

    private patchIosSampleRate(): void {
        let ua: string = navigator.userAgent;
        if (ua.indexOf('iPhone') !== -1 || ua.indexOf('iPad') !== 0) {
            let context: AudioContext = new AudioContext();
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

    public play(): void {
        let ctx = this._context;
        if (!ctx) {
            return;
        }
        if (ctx.state === 'suspended' || (ctx.state as string) === 'interrupted') {
            // tslint:disable-next-line: no-floating-promises
            ctx.resume();
        }
        // create an empty buffer source (silence)
        this._buffer = ctx.createBuffer(2, 4096, ctx.sampleRate);
        // create a script processor node which will replace the silence with the generated audio
        this._audioNode = ctx.createScriptProcessor(4096, 0, 2);
        this._audioNode.onaudioprocess = this.generateSound.bind(this);
        this._circularBuffer.clear();
        this.requestBuffers();
        this._finished = false;
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

    public sequencerFinished(): void {
        this._finished = true;
    }

    public addSamples(f: Float32Array): void {
        this._circularBuffer.write(f, 0, f.length);
    }

    public resetSamples(): void {
        this._circularBuffer.clear();
    }

    private requestBuffers(): void {
        // if we fall under the half of buffers
        // we request one half
        let count: number = ((10 / 2) | 0) * 4096;
        if (this._circularBuffer.count < count && this.sampleRequest) {
            for (let i: number = 0; i < ((10 / 2) | 0); i++) {
                this.sampleRequest.trigger();
            }
        }
    }

    private generateSound(e: AudioProcessingEvent): void {
        let left: Float32Array = e.outputBuffer.getChannelData(0);
        let right: Float32Array = e.outputBuffer.getChannelData(1);
        let samples: number = left.length + right.length;
        if (this._circularBuffer.count < samples) {
            if (this._finished) {
                this.finished.trigger();
            }
        } else {
            let buffer: Float32Array = new Float32Array(samples);
            this._circularBuffer.read(buffer, 0, buffer.length);
            let s: number = 0;
            for (let i: number = 0; i < left.length; i++) {
                left[i] = buffer[s++];
                right[i] = buffer[s++];
            }
            this.samplesPlayed.trigger(left.length);
        }
        if (!this._finished) {
            this.requestBuffers();
        }
    }

    readonly ready: EventEmitter<() => void> = new EventEmitter();
    readonly samplesPlayed: EventEmitter<(count: number) => void> = new EventEmitter();
    readonly sampleRequest: EventEmitter<() => void> = new EventEmitter();
    readonly finished: EventEmitter<() => void> = new EventEmitter();
}
