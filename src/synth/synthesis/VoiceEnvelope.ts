// The SoundFont loading and Audio Synthesis is based on TinySoundFont, licensed under MIT,
// developed by Bernhard Schelling (https://github.com/schellingb/TinySoundFont)
// TypeScript port for alphaTab: (C) 2020 by Daniel Kuschny
// Licensed under: MPL-2.0
import { Envelope } from '@src/synth/synthesis/Envelope';
import { SynthHelper } from '@src/synth/SynthHelper';

export enum VoiceEnvelopeSegment {
    None,
    Delay,
    Attack,
    Hold,
    Decay,
    Sustain,
    Release,
    Done
}

export class VoiceEnvelope {
    private static readonly FastReleaseTime: number = 0.01;

    public level: number = 0;
    public slope: number = 0;

    public samplesUntilNextSegment: number = 0;

    public segment: VoiceEnvelopeSegment = VoiceEnvelopeSegment.None;
    public midiVelocity: number = 0;

    public parameters: Envelope | null = null;

    public segmentIsExponential: boolean = false;
    public isAmpEnv: boolean = false;

    public nextSegment(activeSegment: VoiceEnvelopeSegment, outSampleRate: number): void {
        if (!this.parameters) {
            return;
        }

        while (true) {
            switch (activeSegment) {
                case VoiceEnvelopeSegment.None:
                    this.samplesUntilNextSegment = (this.parameters.delay * outSampleRate) | 0;

                    if (this.samplesUntilNextSegment > 0) {
                        this.segment = VoiceEnvelopeSegment.Delay;
                        this.segmentIsExponential = false;
                        this.level = 0.0;
                        this.slope = 0.0;
                        return;
                    }

                    activeSegment = VoiceEnvelopeSegment.Delay;
                    break;

                case VoiceEnvelopeSegment.Delay:
                    this.samplesUntilNextSegment = (this.parameters.attack * outSampleRate) | 0;

                    if (this.samplesUntilNextSegment > 0) {

                        if (!this.isAmpEnv) {
                            // mod env attack duration scales with velocity (velocity of 1 is full duration, max velocity is 0.125 times duration)
                            this.samplesUntilNextSegment =
                                (this.parameters.attack * ((145 - this.midiVelocity) / 144.0) * outSampleRate) | 0;
                        }

                        this.segment = VoiceEnvelopeSegment.Attack;
                        this.segmentIsExponential = false;
                        this.level = 0.0;
                        this.slope = 1.0 / this.samplesUntilNextSegment;
                        return;
                    }
                    activeSegment = VoiceEnvelopeSegment.Attack;
                    break;

                case VoiceEnvelopeSegment.Attack:
                    this.samplesUntilNextSegment = (this.parameters.hold * outSampleRate) | 0;

                    if (this.samplesUntilNextSegment > 0) {
                        this.segment = VoiceEnvelopeSegment.Hold;
                        this.segmentIsExponential = false;
                        this.level = 1.0;
                        this.slope = 0.0;
                        return;
                    }

                    activeSegment = VoiceEnvelopeSegment.Hold;
                    break;

                case VoiceEnvelopeSegment.Hold:
                    this.samplesUntilNextSegment = (this.parameters.decay * outSampleRate) | 0;
                    if (this.samplesUntilNextSegment > 0) {
                        this.segment = VoiceEnvelopeSegment.Decay;
                        this.level = 1.0;

                        if (this.isAmpEnv) {
                            // I don't truly understand this; just following what LinuxSampler does.
                            let mysterySlope: number = -9.226 / this.samplesUntilNextSegment;
                            this.slope = Math.exp(mysterySlope);
                            this.segmentIsExponential = true;
                            if (this.parameters.sustain > 0.0) {
                                // Again, this is following LinuxSampler's example, which is similar to
                                // SF2-style decay, where "decay" specifies the time it would take to
                                // get to zero, not to the sustain level.  The SFZ spec is not that
                                // specific about what "decay" means, so perhaps it's really supposed
                                // to specify the time to reach the sustain level.
                                this.samplesUntilNextSegment = (Math.log(this.parameters.sustain) / mysterySlope) | 0;
                            }
                        } else {
                            this.slope = -1.0 / this.samplesUntilNextSegment;
                            this.samplesUntilNextSegment =
                                (this.parameters.decay * (1.0 - this.parameters.sustain) * outSampleRate) | 0;
                            this.segmentIsExponential = false;
                        }

                        return;
                    }
                    activeSegment = VoiceEnvelopeSegment.Decay;
                    break;

                case VoiceEnvelopeSegment.Decay:
                    this.segment = VoiceEnvelopeSegment.Sustain;
                    this.level = this.parameters.sustain;
                    this.slope = 0.0;
                    this.samplesUntilNextSegment = 0x7fffffff;
                    this.segmentIsExponential = false;
                    return;

                case VoiceEnvelopeSegment.Sustain:
                    this.segment = VoiceEnvelopeSegment.Release;
                    this.samplesUntilNextSegment =
                        ((this.parameters.release <= 0 ? VoiceEnvelope.FastReleaseTime : this.parameters.release) *
                            outSampleRate) | 0;

                    if (this.isAmpEnv) {
                        // I don't truly understand this; just following what LinuxSampler does.
                        let mysterySlope: number = -9.226 / this.samplesUntilNextSegment;
                        this.slope = Math.exp(mysterySlope);
                        this.segmentIsExponential = true;
                    } else {
                        this.slope = -this.level / this.samplesUntilNextSegment;
                        this.segmentIsExponential = false;
                    }

                    return;
                case VoiceEnvelopeSegment.Release:
                default:
                    this.segment = VoiceEnvelopeSegment.Done;
                    this.segmentIsExponential = false;
                    this.level = this.slope = 0.0;
                    this.samplesUntilNextSegment = 0x7ffffff;
                    return;
            }
        }
    }

    public setup(
        newParameters: Envelope,
        midiNoteNumber: number,
        midiVelocity: number,
        isAmpEnv: boolean,
        outSampleRate: number
    ): void {
        this.parameters = new Envelope(newParameters);
        if (this.parameters.keynumToHold > 0) {
            this.parameters.hold += this.parameters.keynumToHold * (60.0 - midiNoteNumber);
            this.parameters.hold =
                this.parameters.hold < -10000.0 ? 0.0 : SynthHelper.timecents2Secs(this.parameters.hold);
        }

        if (this.parameters.keynumToDecay > 0) {
            this.parameters.decay += this.parameters.keynumToDecay * (60.0 - midiNoteNumber);
            this.parameters.decay =
                this.parameters.decay < -10000.0 ? 0.0 : SynthHelper.timecents2Secs(this.parameters.decay);
        }

        this.midiVelocity = midiVelocity | 0;
        this.isAmpEnv = isAmpEnv;
        this.nextSegment(VoiceEnvelopeSegment.None, outSampleRate);
    }

    public process(numSamples: number, outSampleRate: number): void {
        if (this.slope > 0) {
            if (this.segmentIsExponential) {
                this.level *= Math.pow(this.slope, numSamples);
            } else {
                this.level += this.slope * numSamples;
            }
        }
        
        // tslint:disable-next-line: no-conditional-assignment
        if ((this.samplesUntilNextSegment -= numSamples) <= 0) {
            this.nextSegment(this.segment, outSampleRate);
        }
    }
}
