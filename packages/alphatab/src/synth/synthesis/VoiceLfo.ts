// The SoundFont loading and Audio Synthesis is based on TinySoundFont, licensed under MIT,
// developed by Bernhard Schelling (https://github.com/schellingb/TinySoundFont)
// TypeScript port for alphaTab: (C) 2020 by Daniel Kuschny
// Licensed under: MPL-2.0
import { SynthHelper } from '@src/synth/SynthHelper';

export class VoiceLfo {
    public samplesUntil: number = 0;
    public level: number = 0;
    public delta: number = 0;

    public setup(delay: number, freqCents: number, outSampleRate: number): void {
        this.samplesUntil = (delay * outSampleRate) | 0;
        this.delta = (4.0 * SynthHelper.cents2Hertz(freqCents)) / outSampleRate;
        this.level = 0;
    }

    public process(blockSamples: number): void {
        if (this.samplesUntil > blockSamples) {
            this.samplesUntil -= blockSamples;
            return;
        }
        this.level += this.delta * blockSamples;
        if (this.level > 1.0) {
            this.delta = -this.delta;
            this.level = 2.0 - this.level;
        } else if (this.level < -1.0) {
            this.delta = -this.delta;
            this.level = -2.0 - this.level;
        }
    }
}
