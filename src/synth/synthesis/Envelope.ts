// The SoundFont loading and Audio Synthesis is based on TinySoundFont, licensed under MIT,
// developed by Bernhard Schelling (https://github.com/schellingb/TinySoundFont)
// TypeScript port for alphaTab: (C) 2020 by Daniel Kuschny
// Licensed under: MPL-2.0
import { SynthHelper } from '@src/synth/SynthHelper';

export class Envelope {
    public delay: number = 0;
    public attack: number = 0;
    public hold: number = 0;
    public decay: number = 0;
    public sustain: number = 0;
    public release: number = 0;
    public keynumToHold: number = 0;
    public keynumToDecay: number = 0;

    public constructor(other?: Envelope) {
        if (other) {
            this.delay = other.delay;
            this.attack = other.attack;
            this.hold = other.hold;
            this.decay = other.decay;
            this.sustain = other.sustain;
            this.release = other.release;
            this.keynumToHold = other.keynumToHold;
            this.keynumToDecay = other.keynumToDecay;
        }
    }

    public clear(): void {
        this.delay = 0;
        this.attack = 0;
        this.hold = 0;
        this.decay = 0;
        this.sustain = 0;
        this.release = 0;
        this.keynumToHold = 0;
        this.keynumToDecay = 0;
    }

    public envToSecs(sustainIsGain: boolean): void {
        // EG times need to be converted from timecents to seconds.
        // Pin very short EG segments.  Timecents don't get to zero, and our EG is
        // happier with zero values.
        this.delay = this.delay < -11950.0 ? 0.0 : SynthHelper.timecents2Secs(this.delay);
        this.attack = this.attack < -11950.0 ? 0.0 : SynthHelper.timecents2Secs(this.attack);
        this.release = this.release < -11950.0 ? 0.0 : SynthHelper.timecents2Secs(this.release);

        // If we have dynamic hold or decay times depending on key number we need
        // to keep the values in timecents so we can calculate it during startNote
        if (this.keynumToHold === 0) {
            this.hold = this.hold < -11950.0 ? 0.0 : SynthHelper.timecents2Secs(this.hold);
        }

        if (this.keynumToDecay === 0) {
            this.decay = this.decay < -11950.0 ? 0.0 : SynthHelper.timecents2Secs(this.decay);
        }
        
        if (this.sustain < 0.0) {
            this.sustain = 0.0;
        } else if (sustainIsGain) {
            this.sustain = SynthHelper.decibelsToGain(-this.sustain / 10.0);
        } else {
            this.sustain = 1.0 - this.sustain / 1000.0;
        }
    }
}
