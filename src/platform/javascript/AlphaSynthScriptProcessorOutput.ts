import { CircularSampleBuffer } from '@src/synth/ds/CircularSampleBuffer';
import { AlphaSynthWebAudioOutputBase } from '@src/platform/javascript/AlphaSynthWebAudioOutputBase';
import { SynthConstants } from '@src/synth/SynthConstants';

// tslint:disable: deprecation

/**
 * This class implements a HTML5 Web Audio API based audio output device
 * for alphaSynth using the legacy ScriptProcessor node.
 * @target web
 */
export class AlphaSynthScriptProcessorOutput extends AlphaSynthWebAudioOutputBase {
    private _audioNode: ScriptProcessorNode | null = null;
    private _circularBuffer!: CircularSampleBuffer;
    private _bufferCount: number = 0;
    private _requestedBufferCount: number = 0;

    public override open(bufferTimeInMilliseconds: number) {
        super.open(bufferTimeInMilliseconds);
        this._bufferCount = Math.floor(
            (bufferTimeInMilliseconds * this.sampleRate) / 1000 / AlphaSynthWebAudioOutputBase.BufferSize
        );
        this._circularBuffer = new CircularSampleBuffer(AlphaSynthWebAudioOutputBase.BufferSize * this._bufferCount);
        this.onReady();
    }

    public override play(): void {
        super.play();
        let ctx = this._context!;
        // create a script processor node which will replace the silence with the generated audio
        this._audioNode = ctx.createScriptProcessor(4096, 0, 2);
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

    public override pause(): void {
        super.pause();
        if (this._audioNode) {
            this._audioNode.disconnect(0);
        }
        this._audioNode = null;
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
        let halfSamples: number = halfBufferCount * AlphaSynthWebAudioOutputBase.BufferSize;
        // Issue #631: it can happen that requestBuffers is called multiple times
        // before we already get samples via addSamples, therefore we need to
        // remember how many buffers have been requested, and consider them as available.
        let bufferedSamples =
            this._circularBuffer.count + this._requestedBufferCount * AlphaSynthWebAudioOutputBase.BufferSize;
        if (bufferedSamples < halfSamples) {
            for (let i: number = 0; i < halfBufferCount; i++) {
                this.onSampleRequest();
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
        this.onSamplesPlayed(samplesFromBuffer / SynthConstants.AudioChannels);
        this.requestBuffers();
    }
}
