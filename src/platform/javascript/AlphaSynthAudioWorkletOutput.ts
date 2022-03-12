import { CircularSampleBuffer } from '@src/synth/ds/CircularSampleBuffer';
import { Environment } from '@src/Environment';
import { Logger } from '@src/Logger';
import { AlphaSynthWorkerSynthOutput } from '@src/platform/javascript/AlphaSynthWorkerSynthOutput';
import { AlphaSynthWebAudioOutputBase } from '@src/platform/javascript/AlphaSynthWebAudioOutputBase';
import { SynthConstants } from '@src/synth/SynthConstants';

/**
 * @target web
 */
interface AudioWorkletProcessor {
    readonly port: MessagePort;
    process(inputs: Float32Array[][], outputs: Float32Array[][], parameters: Record<string, Float32Array>): boolean;
}

/**
 * @target web
 */
declare var AudioWorkletProcessor: {
    prototype: AudioWorkletProcessor;
    new (options?: AudioWorkletNodeOptions): AudioWorkletProcessor;
};

// Bug 646: Safari 14.1 is buggy regarding audio worklets
// globalThis cannot be used to access registerProcessor or samplerate
// we need to really use them as globals
/**
 * @target web
 */
declare var registerProcessor: any;
/**
 * @target web
 */
declare var sampleRate: number;

/**
 * This class implements a HTML5 Web Audio API based audio output device
 * for alphaSynth using the modern Audio Worklets.
 * @target web
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

                    this.port.onmessage = this.handleMessage.bind(this);
                }

                private handleMessage(e: MessageEvent) {
                    let data: any = e.data;
                    let cmd: any = data.cmd;
                    switch (cmd) {
                        case AlphaSynthWorkerSynthOutput.CmdOutputAddSamples:
                            const f: Float32Array = data.samples;
                            this._circularBuffer.write(f, 0, f.length);
                            this._requestedBufferCount--;
                            break;
                        case AlphaSynthWorkerSynthOutput.CmdOutputResetSamples:
                            this._circularBuffer.clear();
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

                    let left: Float32Array = outputs[0][0];
                    let right: Float32Array = outputs[0][1];

                    if (!left || !right) {
                        return true;
                    }

                    let samples: number = left.length + right.length;
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
                    for (let i: number = 0; i < left.length; i++) {
                        left[i] = buffer[s++];
                        right[i] = buffer[s++];
                    }
                    this.port.postMessage({
                        cmd: AlphaSynthWorkerSynthOutput.CmdOutputSamplesPlayed,
                        samples: samplesFromBuffer / SynthConstants.AudioChannels
                    });
                    this.requestBuffers();

                    return true;
                }

                private requestBuffers(): void {
                    // if we fall under the half of buffers
                    // we request one half
                    const halfBufferCount = (this._bufferCount / 2) | 0;
                    let halfSamples: number = halfBufferCount * AlphaSynthWebWorkletProcessor.BufferSize;
                    // Issue #631: it can happen that requestBuffers is called multiple times
                    // before we already get samples via addSamples, therefore we need to
                    // remember how many buffers have been requested, and consider them as available.
                    let bufferedSamples =
                        this._circularBuffer.count +
                        this._requestedBufferCount * AlphaSynthWebWorkletProcessor.BufferSize;
                    if (bufferedSamples < halfSamples) {
                        for (let i: number = 0; i < halfBufferCount; i++) {
                            this.port.postMessage({
                                cmd: AlphaSynthWorkerSynthOutput.CmdOutputSampleRequest
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
 */
export class AlphaSynthAudioWorkletOutput extends AlphaSynthWebAudioOutputBase {
    private _worklet: AudioWorkletNode | null = null;
    private _bufferTimeInMilliseconds: number = 0;

    public override open(bufferTimeInMilliseconds: number) {
        super.open(bufferTimeInMilliseconds);
        this._bufferTimeInMilliseconds = bufferTimeInMilliseconds;
        this.onReady();
    }

    public override play(): void {
        super.play();
        let ctx = this._context!;
        // create a script processor node which will replace the silence with the generated audio
        ctx.audioWorklet.addModule(Environment.scriptFile!).then(
            () => {
                this._worklet = new AudioWorkletNode(ctx!, 'alphatab', {
                    numberOfOutputs: 1,
                    outputChannelCount: [2],
                    processorOptions: {
                        bufferTimeInMilliseconds: this._bufferTimeInMilliseconds
                    }
                });
                this._worklet.port.onmessage = this.handleMessage.bind(this);
                this._source!.connect(this._worklet);
                this._source!.start(0);
                this._worklet.connect(ctx!.destination);
            },
            reason => {
                Logger.error('WebAudio', `Audio Worklet creation failed: reason=${reason}`);
            }
        );
    }

    private handleMessage(e: MessageEvent) {
        let data: any = e.data;
        let cmd: any = data.cmd;
        switch (cmd) {
            case AlphaSynthWorkerSynthOutput.CmdOutputSamplesPlayed:
                this.onSamplesPlayed(data.samples);
                break;
            case AlphaSynthWorkerSynthOutput.CmdOutputSampleRequest:
                this.onSampleRequest();
                break;
        }
    }

    public override pause(): void {
        super.pause();
        if (this._worklet) {
            this._worklet.port.onmessage = null;
            this._worklet.disconnect();
        }
        this._worklet = null;
    }

    public addSamples(f: Float32Array): void {
        this._worklet?.port.postMessage({
            cmd: AlphaSynthWorkerSynthOutput.CmdOutputAddSamples,
            samples: f
        });
    }

    public resetSamples(): void {
        this._worklet?.port.postMessage({
            cmd: AlphaSynthWorkerSynthOutput.CmdOutputResetSamples
        });
    }
}
