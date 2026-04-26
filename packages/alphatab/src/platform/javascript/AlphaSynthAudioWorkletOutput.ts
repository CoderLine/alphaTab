import { Environment } from '@coderline/alphatab/Environment';
import { Logger } from '@coderline/alphatab/Logger';
import type { Settings } from '@coderline/alphatab/Settings';
import { AlphaSynthWebAudioOutputBase } from '@coderline/alphatab/platform/javascript/AlphaSynthWebAudioOutputBase';
import { BrowserUiFacade } from '@coderline/alphatab/platform/javascript/BrowserUiFacade';
import type {
    IAlphaSynthWorkerMessage,
    IAlphaTabWorker
} from '@coderline/alphatab/platform/worker/AlphaTabWorkerProtocol';
import { SynthConstants } from '@coderline/alphatab/synth/SynthConstants';
import { CircularSampleBuffer } from '@coderline/alphatab/synth/ds/CircularSampleBuffer';

/**
 * @target web
 * @internal
 */
type AudioWorkletProcessorMessagePort<T> = Omit<IAlphaTabWorker<T>, 'terminate'> & Pick<MessagePort, 'start'>;

/**
 * @target web
 * @internal
 */
interface AudioWorkletProcessor {
    readonly port: AudioWorkletProcessorMessagePort<IAlphaSynthWorkerMessage>;
    process(inputs: Float32Array[][], outputs: Float32Array[][], parameters: Record<string, Float32Array>): boolean;
}

/**
 * @target web
 * @internal
 */
declare let AudioWorkletProcessor: {
    prototype: AudioWorkletProcessor;
    new (options?: AudioWorkletNodeOptions): AudioWorkletProcessor;
};

/**
 * @target web
 * @internal
 */
interface AudioWorkletNode<T> extends AudioNode {
    readonly port: AudioWorkletProcessorMessagePort<T>;
}

// Bug 646: Safari 14.1 is buggy regarding audio worklets
// globalThis cannot be used to access registerProcessor or samplerate
// we need to really use them as globals
/**
 * @target web
 * @internal
 */
declare let registerProcessor: any;
/**
 * @target web
 * @internal
 */
declare let sampleRate: number;

/**
 * This class implements a HTML5 Web Audio API based audio output device
 * for alphaSynth using the modern Audio Worklets.
 * @target web
 * @internal
 */
export class AlphaSynthWebWorklet {
    private static _isRegistered = false;
    public static init() {
        if (AlphaSynthWebWorklet._isRegistered) {
            return;
        }
        AlphaSynthWebWorklet._isRegistered = true;
        registerProcessor(
            'alphatab',
            class AlphaSynthWebWorkletProcessor extends AudioWorkletProcessor {
                public static readonly BufferSize: number = 4096;

                private _outputBuffer: Float32Array = new Float32Array(0);
                private _circularBuffer!: CircularSampleBuffer;
                private _bufferCount: number = 0;
                private _requestedBufferCount: number = 0;
                private _isStopped = false;

                constructor(options: AudioWorkletNodeOptions) {
                    super(options);

                    Logger.debug('WebAudio', 'creating processor');

                    this._bufferCount = Math.floor(
                        (options.processorOptions.bufferTimeInMilliseconds * sampleRate) /
                            1000 /
                            AlphaSynthWebWorkletProcessor.BufferSize
                    );
                    this._circularBuffer = new CircularSampleBuffer(
                        AlphaSynthWebWorkletProcessor.BufferSize * this._bufferCount
                    );

                    this.port.addEventListener('message', e => this._handleMessage(e));
                    this.port.start();
                }

                private _handleMessage(e: MessageEvent<IAlphaSynthWorkerMessage>) {
                    const data = e.data;
                    const cmd = data.cmd;
                    switch (cmd) {
                        case 'alphaSynth.output.addSamples':
                            const f: Float32Array = data.samples;
                            this._circularBuffer.write(f, 0, f.length);
                            this._requestedBufferCount--;
                            break;
                        case 'alphaSynth.output.resetSamples':
                            this._circularBuffer.clear();
                            break;
                        case 'alphaSynth.output.stop':
                            this._isStopped = true;
                            break;
                    }
                }

                public override process(
                    _inputs: Float32Array[][],
                    outputs: Float32Array[][],
                    _parameters: Record<string, Float32Array>
                ): boolean {
                    if (outputs.length !== 1 && outputs[0].length !== 2) {
                        return false;
                    }

                    const left: Float32Array = outputs[0][0];
                    const right: Float32Array = outputs[0][1];

                    if (!left || !right) {
                        return true;
                    }

                    const samples: number = left.length + right.length;
                    let buffer = this._outputBuffer;
                    if (buffer.length !== samples) {
                        buffer = new Float32Array(samples);
                        this._outputBuffer = buffer;
                    }
                    const samplesFromBuffer = this._circularBuffer.read(
                        buffer,
                        0,
                        Math.min(buffer.length, this._circularBuffer.count)
                    );
                    let s: number = 0;
                    const min = Math.min(left.length, samplesFromBuffer);
                    for (let i: number = 0; i < min; i++) {
                        left[i] = buffer[s++];
                        right[i] = buffer[s++];
                    }

                    if (samplesFromBuffer < left.length) {
                        for (let i = samplesFromBuffer; i < left.length; i++) {
                            left[i] = 0;
                            right[i] = 0;
                        }
                    }

                    this.port.postMessage({
                        cmd: 'alphaSynth.output.samplesPlayed',
                        samples: samplesFromBuffer / SynthConstants.AudioChannels
                    });
                    this._requestBuffers();

                    return this._circularBuffer.count > 0 || !this._isStopped;
                }

                private _requestBuffers(): void {
                    // if we fall under the half of buffers
                    // we request one half
                    const halfBufferCount = (this._bufferCount / 2) | 0;
                    const halfSamples: number = halfBufferCount * AlphaSynthWebWorkletProcessor.BufferSize;
                    // Issue #631: it can happen that requestBuffers is called multiple times
                    // before we already get samples via addSamples, therefore we need to
                    // remember how many buffers have been requested, and consider them as available.
                    const bufferedSamples =
                        this._circularBuffer.count +
                        this._requestedBufferCount * AlphaSynthWebWorkletProcessor.BufferSize;
                    if (bufferedSamples < halfSamples) {
                        for (let i: number = 0; i < halfBufferCount; i++) {
                            this.port.postMessage({
                                cmd: 'alphaSynth.output.sampleRequest'
                            });
                        }
                        this._requestedBufferCount += halfBufferCount;
                    }
                }
            }
        );
    }
}

/**
 * This class implements a HTML5 Web Audio API based audio output device
 * for alphaSynth. It can be controlled via a JS API.
 * @target web
 * @internal
 */
export class AlphaSynthAudioWorkletOutput extends AlphaSynthWebAudioOutputBase {
    private _worklet: AudioWorkletNode<IAlphaSynthWorkerMessage> | null = null;
    private _bufferTimeInMilliseconds: number = 0;
    private readonly _settings: Settings;
    private _boundHandleMessage: (e: MessageEvent<IAlphaSynthWorkerMessage>) => void;

    private _pendingEvents?: IAlphaSynthWorkerMessage[];

    public constructor(settings: Settings) {
        super();
        this._settings = settings;
        this._boundHandleMessage = e => this._handleMessage(e);
    }

    public override open(bufferTimeInMilliseconds: number) {
        super.open(bufferTimeInMilliseconds);
        this._bufferTimeInMilliseconds = bufferTimeInMilliseconds;
        this.onReady();
    }

    public override play(): void {
        super.play();
        const ctx = this.context!;
        // create a script processor node which will replace the silence with the generated audio
        BrowserUiFacade.createAlphaSynthAudioWorklet(ctx, this._settings).then(
            () => {
                this._worklet = new AudioWorkletNode(ctx!, 'alphatab', {
                    numberOfOutputs: 1,
                    outputChannelCount: [2],
                    processorOptions: {
                        bufferTimeInMilliseconds: this._bufferTimeInMilliseconds
                    }
                }) as AudioWorkletNode<IAlphaSynthWorkerMessage>;

                this._worklet.port.addEventListener('message', this._boundHandleMessage);
                this._worklet.port.start();
                this.source!.connect(this._worklet);
                this.source!.start(0);
                this._worklet.connect(ctx!.destination);

                const pending = this._pendingEvents;
                if (pending) {
                    for (const e of pending) {
                        this._worklet.port.postMessage(e);
                    }
                    this._pendingEvents = undefined;
                }
            },
            (reason: any) => {
                Logger.error('WebAudio', `Audio Worklet creation failed: reason=${reason}`);
            }
        );
    }

    private _handleMessage(e: MessageEvent<IAlphaSynthWorkerMessage>) {
        const data = e.data;
        const cmd = data.cmd;
        switch (cmd) {
            case 'alphaSynth.output.samplesPlayed':
                this.onSamplesPlayed(data.samples);
                break;
            case 'alphaSynth.output.sampleRequest':
                this.onSampleRequest();
                break;
        }
    }

    public override pause(): void {
        super.pause();
        if (this._worklet) {
            this._worklet.port.postMessage({
                cmd: 'alphaSynth.output.stop'
            });
            this._worklet.port.removeEventListener('message', this._boundHandleMessage);
            this._worklet.disconnect();
        }
        this._worklet = null;
        this._pendingEvents = undefined;
    }

    private _postWorkerMessage(message: IAlphaSynthWorkerMessage) {
        const worklet = this._worklet;
        if (worklet) {
            worklet.port.postMessage(message);
        } else {
            this._pendingEvents ??= [];
            this._pendingEvents.push(message);
        }
    }

    public addSamples(f: Float32Array): void {
        this._postWorkerMessage({
            cmd: 'alphaSynth.output.addSamples',
            samples: Environment.prepareForPostMessage(f)
        });
    }

    public resetSamples(): void {
        this._postWorkerMessage({
            cmd: 'alphaSynth.output.resetSamples'
        });
    }
}
