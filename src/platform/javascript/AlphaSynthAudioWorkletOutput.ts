import { CircularSampleBuffer } from '@src/synth/ds/CircularSampleBuffer';
import { Environment } from '@src/Environment';
import { Logger } from '@src/Logger';
import { AlphaSynthWorkerSynthOutput } from './AlphaSynthWorkerSynthOutput';
import { AlphaSynthWebAudioOutputBase } from './AlphaSynthWebAudioOutputBase';

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

/**
 * This class implements a HTML5 Web Audio API based audio output device
 * for alphaSynth using the modern Audio Worklets.
 * @target web
 */
export class AlphaSynthWebWorklet {
    public static init() {
        (Environment.globalThis as any).registerProcessor(
            'alphatab',
            class AlphaSynthWebWorkletProcessor extends AudioWorkletProcessor {
                public static readonly BufferSize: number = 4096;
                private static readonly TotalBufferTimeInMilliseconds: number = 5000;

                private _outputBuffer: Float32Array = new Float32Array(0);
                private _circularBuffer!: CircularSampleBuffer;
                private _bufferCount: number = 0;
                private _requestedBufferCount: number = 0;

                constructor(...args: any[]) {
                    super(...args);

                    this._bufferCount = Math.floor(
                        (AlphaSynthWebWorkletProcessor.TotalBufferTimeInMilliseconds *
                            Environment.globalThis.sampleRate) /
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

                public process(
                    _inputs: Float32Array[][],
                    outputs: Float32Array[][],
                    _parameters: Record<string, Float32Array>
                ): boolean {
                    if (outputs.length !== 1 && outputs[0].length !== 2) {
                        return false;
                    }
                    let left: Float32Array = outputs[0][0];
                    let right: Float32Array = outputs[0][1];
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
                    this.port.postMessage({
                        cmd: AlphaSynthWorkerSynthOutput.CmdOutputSamplesPlayed,
                        samples: left.length
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

    public open() {
        super.open();
        this.onReady();
    }

    public play(): void {
        super.play();
        let ctx = this._context!;
        // create a script processor node which will replace the silence with the generated audio
        ctx.audioWorklet.addModule(Environment.scriptFile!).then(
            () => {
                this._worklet = new AudioWorkletNode(ctx!, 'alphatab');
                this._worklet.port.onmessage = this.handleMessage.bind(this);

                this._source!.connect(this._worklet, 0, 0);
                this._source!.start(0);
                this._worklet.connect(ctx!.destination);
            },
            reason => {
                Logger.debug('WebAudio', `Audio Worklet creation failed: reason=${reason}`);
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

    public pause(): void {
        super.pause();
        if (this._worklet) {
            this._worklet.disconnect(0);
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
