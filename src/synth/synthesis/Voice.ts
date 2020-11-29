// The SoundFont loading and Audio Synthesis is based on TinySoundFont, licensed under MIT,
// developed by Bernhard Schelling (https://github.com/schellingb/TinySoundFont)
// TypeScript port for alphaTab: (C) 2020 by Daniel Kuschny
// Licensed under: MPL-2.0
import { LoopMode } from '@src/synth/synthesis/LoopMode';
import { OutputMode } from '@src/synth/synthesis/OutputMode';
import { Region } from '@src/synth/synthesis/Region';
import { TinySoundFont } from '@src/synth/synthesis/TinySoundFont';
import { VoiceEnvelope, VoiceEnvelopeSegment } from '@src/synth/synthesis/VoiceEnvelope';
import { VoiceLfo } from '@src/synth/synthesis/VoiceLfo';
import { VoiceLowPass } from '@src/synth/synthesis/VoiceLowPass';
import { SynthHelper } from '@src/synth/SynthHelper';
import { SynthConstants } from '../SynthConstants';
import { Channel } from './Channel';

export class Voice {
    /**
     * The lower this block size is the more accurate the effects are.
     * Increasing the value significantly lowers the CPU usage of the voice rendering.
     * If LFO affects the low-pass filter it can be hearable even as low as 8.
     */
    private static readonly RenderEffectSampleBlock: number = SynthConstants.MicroBufferSize;

    public playingPreset: number = 0;
    public playingKey: number = 0;
    public playingChannel: number = 0;

    public region: Region | null = null;

    public pitchInputTimecents: number = 0;
    public pitchOutputFactor: number = 0;
    public sourceSamplePosition: number = 0;

    public noteGainDb: number = 0;
    public panFactorLeft: number = 0;
    public panFactorRight: number = 0;

    public playIndex: number = 0;
    public loopStart: number = 0;
    public loopEnd: number = 0;

    public ampEnv: VoiceEnvelope = new VoiceEnvelope();
    public modEnv: VoiceEnvelope = new VoiceEnvelope();

    public lowPass: VoiceLowPass = new VoiceLowPass();
    public modLfo: VoiceLfo = new VoiceLfo();
    public vibLfo: VoiceLfo = new VoiceLfo();

    public mixVolume: number = 0;
    public mute: boolean = false;

    public updatePitchRatio(c: Channel, outSampleRate: number) {
        let pitchWheel = c.pitchWheel;
        // add additional note pitch
        if (c.perNotePitchWheel.has(this.playingKey)) {
            pitchWheel += (c.perNotePitchWheel.get(this.playingKey)! - 8192);
        }

        const pitchShift: number = pitchWheel === 8192
            ? c.tuning
            : (pitchWheel / 16383.0 * c.pitchRange * 2) - c.pitchRange + c.tuning;

        this.calcPitchRatio(pitchShift, outSampleRate);
    }

    public calcPitchRatio(pitchShift: number, outSampleRate: number): void {
        if (!this.region) {
            return;
        }

        const note: number = this.playingKey + this.region.transpose + this.region.tune / 100.0;
        let adjustedPitch: number =
            this.region.pitchKeyCenter + (note - this.region.pitchKeyCenter) * (this.region.pitchKeyTrack / 100.0);
        if (pitchShift !== 0) adjustedPitch += pitchShift;
        this.pitchInputTimecents = adjustedPitch * 100.0;
        this.pitchOutputFactor =
            this.region.sampleRate / (SynthHelper.timecents2Secs(this.region.pitchKeyCenter * 100.0) * outSampleRate);
    }

    public end(outSampleRate: number): void {
        if (!this.region) {
            return;
        }

        this.ampEnv.nextSegment(VoiceEnvelopeSegment.Sustain, outSampleRate);
        this.modEnv.nextSegment(VoiceEnvelopeSegment.Sustain, outSampleRate);
        if (this.region.loopMode === LoopMode.Sustain) {
            // Continue playing, but stop looping.
            this.loopEnd = this.loopStart;
        }
    }

    public endQuick(outSampleRate: number): void {
        this.ampEnv.parameters!.release = 0.0;
        this.ampEnv.nextSegment(VoiceEnvelopeSegment.Sustain, outSampleRate);
        this.modEnv.parameters!.release = 0.0;
        this.modEnv.nextSegment(VoiceEnvelopeSegment.Sustain, outSampleRate);
    }

    public render(
        f: TinySoundFont,
        outputBuffer: Float32Array,
        offset: number,
        numSamples: number,
        isMuted: boolean
    ): void {
        if (!this.region) {
            return;
        }

        let region: Region = this.region;
        const preset = f.presets![this.playingPreset];
        let input: Float32Array = preset.fontSamples!;
        let outL: number = 0;
        let outR: number = f.outputMode === OutputMode.StereoUnweaved ? numSamples : -1;

        // Cache some values, to give them at least some chance of ending up in registers.
        let updateModEnv: boolean = region.modEnvToPitch !== 0 || region.modEnvToFilterFc !== 0;
        let updateModLFO: boolean =
            this.modLfo.delta > 0 &&
            (region.modLfoToPitch !== 0 || region.modLfoToFilterFc !== 0 || region.modLfoToVolume !== 0);
        let updateVibLFO: boolean = this.vibLfo.delta > 0 && region.vibLfoToPitch !== 0;
        let isLooping: boolean = this.loopStart < this.loopEnd;
        let tmpLoopStart: number = this.loopStart;
        let tmpLoopEnd: number = this.loopEnd;
        let tmpSampleEndDbl: number = region.end;
        let tmpLoopEndDbl: number = tmpLoopEnd + 1.0;
        let tmpSourceSamplePosition: number = this.sourceSamplePosition;

        let tmpLowpass: VoiceLowPass = new VoiceLowPass(this.lowPass);

        let dynamicLowpass: boolean = region.modLfoToFilterFc !== 0 || region.modEnvToFilterFc !== 0;
        let tmpSampleRate: number = 0;
        let tmpInitialFilterFc: number = 0;
        let tmpModLfoToFilterFc: number = 0;
        let tmpModEnvToFilterFc: number = 0;

        let dynamicPitchRatio: boolean =
            region.modLfoToPitch !== 0 || region.modEnvToPitch !== 0 || region.vibLfoToPitch !== 0;
        let pitchRatio: number = 0;
        let tmpModLfoToPitch: number = 0;
        let tmpVibLfoToPitch: number = 0;
        let tmpModEnvToPitch: number = 0;

        let dynamicGain: boolean = region.modLfoToVolume !== 0;
        let noteGain: number = 0;
        let tmpModLfoToVolume: number = 0;

        if (dynamicLowpass) {
            tmpSampleRate = f.outSampleRate;
            tmpInitialFilterFc = region.initialFilterFc;
            tmpModLfoToFilterFc = region.modLfoToFilterFc;
            tmpModEnvToFilterFc = region.modEnvToFilterFc;
        } else {
            tmpSampleRate = 0;
            tmpInitialFilterFc = 0;
            tmpModLfoToFilterFc = 0;
            tmpModEnvToFilterFc = 0;
        }

        if (dynamicPitchRatio) {
            pitchRatio = 0;
            tmpModLfoToPitch = region.modLfoToPitch;
            tmpVibLfoToPitch = region.vibLfoToPitch;
            tmpModEnvToPitch = region.modEnvToPitch;
        } else {
            pitchRatio = SynthHelper.timecents2Secs(this.pitchInputTimecents) * this.pitchOutputFactor;
            tmpModLfoToPitch = 0;
            tmpVibLfoToPitch = 0;
            tmpModEnvToPitch = 0;
        }

        if (dynamicGain) {
            tmpModLfoToVolume = region.modLfoToVolume * 0.1;
        } else {
            noteGain = SynthHelper.decibelsToGain(this.noteGainDb);
            tmpModLfoToVolume = 0;
        }

        while (numSamples > 0) {
            let gainMono: number;
            let gainLeft: number;
            let gainRight: number = 0;
            let blockSamples: number = numSamples > Voice.RenderEffectSampleBlock ? Voice.RenderEffectSampleBlock : numSamples;
            numSamples -= blockSamples;

            if (dynamicLowpass) {
                let fres: number =
                    tmpInitialFilterFc +
                    this.modLfo.level * tmpModLfoToFilterFc +
                    this.modEnv.level * tmpModEnvToFilterFc;
                tmpLowpass.active = fres <= 13500.0;
                if (tmpLowpass.active) {
                    tmpLowpass.setup(SynthHelper.cents2Hertz(fres) / tmpSampleRate);
                }
            }

            if (dynamicPitchRatio) {
                pitchRatio =
                    SynthHelper.timecents2Secs(
                        this.pitchInputTimecents +
                        (this.modLfo.level * tmpModLfoToPitch +
                            this.vibLfo.level * tmpVibLfoToPitch +
                            this.modEnv.level * tmpModEnvToPitch)
                    ) * this.pitchOutputFactor;
            }

            if (dynamicGain) {
                noteGain = SynthHelper.decibelsToGain(this.noteGainDb + this.modLfo.level * tmpModLfoToVolume);
            }

            gainMono = noteGain * this.ampEnv.level;

            if (isMuted) {
                gainMono = 0;
            } else {
                gainMono *= this.mixVolume;
            }

            // Update EG.
            this.ampEnv.process(blockSamples, f.outSampleRate);
            if (updateModEnv) {
                this.modEnv.process(blockSamples, f.outSampleRate);
            }

            // Update LFOs.
            if (updateModLFO) {
                this.modLfo.process(blockSamples);
            }

            if (updateVibLFO) {
                this.vibLfo.process(blockSamples);
            }

            switch (f.outputMode) {
                case OutputMode.StereoInterleaved:
                    gainLeft = gainMono * this.panFactorLeft;
                    gainRight = gainMono * this.panFactorRight;
                    while (blockSamples-- > 0 && tmpSourceSamplePosition < tmpSampleEndDbl) {
                        let pos: number = tmpSourceSamplePosition | 0;
                        let nextPos: number = pos >= tmpLoopEnd && isLooping ? tmpLoopStart : pos + 1;

                        // Simple linear interpolation.

                        // TODO: check for interpolation mode on voice
                        let alpha: number = tmpSourceSamplePosition - pos;
                        let val: number = input[pos] * (1.0 - alpha) + input[nextPos] * alpha;

                        // Low-pass filter.
                        if (tmpLowpass.active) val = tmpLowpass.process(val);

                        outputBuffer[offset + outL] += val * gainLeft;
                        outL++;
                        outputBuffer[offset + outL] += val * gainRight;
                        outL++;

                        // Next sample.
                        tmpSourceSamplePosition += pitchRatio;
                        if (tmpSourceSamplePosition >= tmpLoopEndDbl && isLooping) {
                            tmpSourceSamplePosition -= tmpLoopEnd - tmpLoopStart + 1.0;
                        }
                    }
                    break;
                case OutputMode.StereoUnweaved:
                    gainLeft = gainMono * this.panFactorLeft;
                    gainRight = gainMono * this.panFactorRight;
                    while (blockSamples-- > 0 && tmpSourceSamplePosition < tmpSampleEndDbl) {
                        let pos: number = tmpSourceSamplePosition | 0;
                        let nextPos: number = pos >= tmpLoopEnd && isLooping ? tmpLoopStart : pos + 1;

                        // Simple linear interpolation.
                        let alpha: number = tmpSourceSamplePosition - pos;
                        let val: number = input[pos] * (1.0 - alpha) + input[nextPos] * alpha;

                        // Low-pass filter.
                        if (tmpLowpass.active) val = tmpLowpass.process(val);

                        outputBuffer[offset + outL] += val * gainLeft;
                        outL++;
                        outputBuffer[offset + outR] += val * gainRight;
                        outR++;

                        // Next sample.
                        tmpSourceSamplePosition += pitchRatio;
                        if (tmpSourceSamplePosition >= tmpLoopEndDbl && isLooping) {
                            tmpSourceSamplePosition -= tmpLoopEnd - tmpLoopStart + 1.0;
                        }
                    }
                    break;
                case OutputMode.Mono:
                    while (blockSamples-- > 0 && tmpSourceSamplePosition < tmpSampleEndDbl) {
                        let pos: number = tmpSourceSamplePosition | 0;
                        let nextPos: number = pos >= tmpLoopEnd && isLooping ? tmpLoopStart : pos + 1;

                        // Simple linear interpolation.
                        let alpha: number = tmpSourceSamplePosition - pos;
                        let val: number = input[pos] * (1.0 - alpha) + input[nextPos] * alpha;

                        // Low-pass filter.
                        if (tmpLowpass.active) val = tmpLowpass.process(val);

                        outputBuffer[offset + outL] = val * gainMono;
                        outL++;

                        // Next sample.
                        tmpSourceSamplePosition += pitchRatio;
                        if (tmpSourceSamplePosition >= tmpLoopEndDbl && isLooping) {
                            tmpSourceSamplePosition -= tmpLoopEnd - tmpLoopStart + 1.0;
                        }
                    }
                    break;
            }

            if (tmpSourceSamplePosition >= tmpSampleEndDbl || this.ampEnv.segment === VoiceEnvelopeSegment.Done) {
                this.kill();
                return;
            }
        }

        this.sourceSamplePosition = tmpSourceSamplePosition;
        if (tmpLowpass.active || dynamicLowpass) {
            this.lowPass = tmpLowpass;
        }
    }

    public kill(): void {
        this.playingPreset = -1;
    }
}
