// The SoundFont loading and Audio Synthesis is based on TinySoundFont, licensed under MIT,
// developed by Bernhard Schelling (https://github.com/schellingb/TinySoundFont)
// TypeScript port for alphaTab: (C) 2020 by Daniel Kuschny
// Licensed under: MPL-2.0
import type { HydraGenAmount } from '@src/synth/soundfont/Hydra';
import { Envelope } from '@src/synth/synthesis/Envelope';
import { LoopMode } from '@src/synth/synthesis/LoopMode';
import { TypeConversions } from '@src/io/TypeConversions';

export enum GenOperators {
    StartAddrsOffset = 0,
    EndAddrsOffset = 1,
    StartloopAddrsOffset = 2,
    EndloopAddrsOffset = 3,
    StartAddrsCoarseOffset = 4,
    ModLfoToPitch = 5,
    VibLfoToPitch = 6,
    ModEnvToPitch = 7,
    InitialFilterFc = 8,
    InitialFilterQ = 9,
    ModLfoToFilterFc = 10,
    ModEnvToFilterFc = 11,
    EndAddrsCoarseOffset = 12,
    ModLfoToVolume = 13,
    Unused1 = 14,
    ChorusEffectsSend = 15,
    ReverbEffectsSend = 16,
    Pan = 17,
    Unused2 = 18,
    Unused3 = 19,
    Unused4 = 20,
    DelayModLFO = 21,
    FreqModLFO = 22,
    DelayVibLFO = 23,
    FreqVibLFO = 24,
    DelayModEnv = 25,
    AttackModEnv = 26,
    HoldModEnv = 27,
    DecayModEnv = 28,
    SustainModEnv = 29,
    ReleaseModEnv = 30,
    KeynumToModEnvHold = 31,
    KeynumToModEnvDecay = 32,
    DelayVolEnv = 33,
    AttackVolEnv = 34,
    HoldVolEnv = 35,
    DecayVolEnv = 36,
    SustainVolEnv = 37,
    ReleaseVolEnv = 38,
    KeynumToVolEnvHold = 39,
    KeynumToVolEnvDecay = 40,
    Instrument = 41,
    Reserved1 = 42,
    KeyRange = 43,
    VelRange = 44,
    StartloopAddrsCoarseOffset = 45,
    Keynum = 46,
    Velocity = 47,
    InitialAttenuation = 48,
    Reserved2 = 49,
    EndloopAddrsCoarseOffset = 50,
    CoarseTune = 51,
    FineTune = 52,
    SampleID = 53,
    SampleModes = 54,
    Reserved3 = 55,
    ScaleTuning = 56,
    ExclusiveClass = 57,
    OverridingRootKey = 58,
    Unused5 = 59,
    EndOper = 60
}

export class Region {
    private static readonly NoSamples = new Float32Array(0);

    public loopMode: LoopMode = LoopMode.None;
    public samples: Float32Array = Region.NoSamples;
    public sampleRate: number = 0;
    public loKey: number = 0;
    public hiKey: number = 0;
    public loVel: number = 0;
    public hiVel: number = 0;
    public group: number = 0;
    public offset: number = 0;
    public end: number = 0;
    public loopStart: number = 0;
    public loopEnd: number = 0;
    public transpose: number = 0;
    public tune: number = 0;
    public pitchKeyCenter: number = 0;
    public pitchKeyTrack: number = 0;
    public attenuation: number = 0;
    public pan: number = 0;
    public ampEnv: Envelope = new Envelope();
    public modEnv: Envelope = new Envelope();
    public initialFilterQ: number = 0;
    public initialFilterFc: number = 0;
    public modEnvToPitch: number = 0;
    public modEnvToFilterFc: number = 0;
    public modLfoToFilterFc: number = 0;
    public modLfoToVolume: number = 0;
    public delayModLFO: number = 0;
    public freqModLFO: number = 0;
    public modLfoToPitch: number = 0;
    public delayVibLFO: number = 0;
    public freqVibLFO: number = 0;
    public vibLfoToPitch: number = 0;

    public constructor(other?: Region) {
        if (other) {
            this.loopMode = other.loopMode;
            this.samples = other.samples;
            this.sampleRate = other.sampleRate;
            this.loKey = other.loKey;
            this.hiKey = other.hiKey;
            this.loVel = other.loVel;
            this.hiVel = other.hiVel;
            this.group = other.group;
            this.offset = other.offset;
            this.end = other.end;
            this.loopStart = other.loopStart;
            this.loopEnd = other.loopEnd;
            this.transpose = other.transpose;
            this.tune = other.tune;
            this.pitchKeyCenter = other.pitchKeyCenter;
            this.pitchKeyTrack = other.pitchKeyTrack;
            this.attenuation = other.attenuation;
            this.pan = other.pan;
            this.ampEnv = new Envelope(other.ampEnv);
            this.modEnv = new Envelope(other.modEnv);
            this.initialFilterQ = other.initialFilterQ;
            this.initialFilterFc = other.initialFilterFc;
            this.modEnvToPitch = other.modEnvToPitch;
            this.modEnvToFilterFc = other.modEnvToFilterFc;
            this.modLfoToFilterFc = other.modLfoToFilterFc;
            this.modLfoToVolume = other.modLfoToVolume;
            this.delayModLFO = other.delayModLFO;
            this.freqModLFO = other.freqModLFO;
            this.modLfoToPitch = other.modLfoToPitch;
            this.delayVibLFO = other.delayVibLFO;
            this.freqVibLFO = other.freqVibLFO;
            this.vibLfoToPitch = other.vibLfoToPitch;
        }
    }

    public clear(forRelative: boolean): void {
        this.loopMode = LoopMode.None;
        this.samples = Region.NoSamples;
        this.sampleRate = 0;
        this.loKey = 0;
        this.hiKey = 0;
        this.loVel = 0;
        this.hiVel = 0;
        this.group = 0;
        this.offset = 0;
        this.end = 0;
        this.loopStart = 0;
        this.loopEnd = 0;
        this.transpose = 0;
        this.tune = 0;
        this.pitchKeyCenter = 0;
        this.pitchKeyTrack = 0;
        this.attenuation = 0;
        this.pan = 0;
        this.ampEnv.clear();
        this.modEnv.clear();
        this.initialFilterQ = 0;
        this.initialFilterFc = 0;
        this.modEnvToPitch = 0;
        this.modEnvToFilterFc = 0;
        this.modLfoToFilterFc = 0;
        this.modLfoToVolume = 0;
        this.delayModLFO = 0;
        this.freqModLFO = 0;
        this.modLfoToPitch = 0;
        this.delayVibLFO = 0;
        this.freqVibLFO = 0;
        this.vibLfoToPitch = 0;

        this.hiKey = 127;
        this.hiVel = 127;
        this.pitchKeyCenter = 60; // C4

        if (forRelative) {
            return;
        }

        this.pitchKeyTrack = 100;

        this.pitchKeyCenter = -1;

        // SF2 defaults in timecents.
        this.ampEnv.delay = -12000.0;
        this.ampEnv.attack = -12000.0;
        this.ampEnv.hold = -12000.0;
        this.ampEnv.decay = -12000.0;
        this.ampEnv.release = -12000.0;
        this.modEnv.delay = -12000.0;
        this.modEnv.attack = -12000.0;
        this.modEnv.hold = -12000.0;
        this.modEnv.decay = -12000.0;
        this.modEnv.release = -12000.0;

        this.initialFilterFc = 13500;

        this.delayModLFO = -12000.0;
        this.delayVibLFO = -12000.0;
    }

    public operator(genOper: number, amount: HydraGenAmount): void {
        switch (genOper as GenOperators) {
            case GenOperators.StartAddrsOffset:
                this.offset += TypeConversions.int16ToUint32(amount.shortAmount);
                break;
            case GenOperators.EndAddrsOffset:
                this.end += TypeConversions.int16ToUint32(amount.shortAmount);
                break;
            case GenOperators.StartloopAddrsOffset:
                this.loopStart += TypeConversions.int16ToUint32(amount.shortAmount);
                break;
            case GenOperators.EndloopAddrsOffset:
                this.loopEnd += TypeConversions.int16ToUint32(amount.shortAmount);
                break;
            case GenOperators.StartAddrsCoarseOffset:
                this.offset += TypeConversions.int16ToUint32(amount.shortAmount) * 32768;
                break;
            case GenOperators.ModLfoToPitch:
                this.modLfoToPitch = amount.shortAmount;
                break;
            case GenOperators.VibLfoToPitch:
                this.vibLfoToPitch = amount.shortAmount;
                break;
            case GenOperators.ModEnvToPitch:
                this.modEnvToPitch = amount.shortAmount;
                break;
            case GenOperators.InitialFilterFc:
                this.initialFilterFc = amount.shortAmount;
                break;
            case GenOperators.InitialFilterQ:
                this.initialFilterQ = amount.shortAmount;
                break;
            case GenOperators.ModLfoToFilterFc:
                this.modLfoToFilterFc = amount.shortAmount;
                break;
            case GenOperators.ModEnvToFilterFc:
                this.modEnvToFilterFc = amount.shortAmount;
                break;
            case GenOperators.EndAddrsCoarseOffset:
                this.end += TypeConversions.int16ToUint32(amount.shortAmount) * 32768;
                break;
            case GenOperators.ModLfoToVolume:
                this.modLfoToVolume = amount.shortAmount;
                break;
            case GenOperators.Pan:
                this.pan = amount.shortAmount / 1000.0;
                break;
            case GenOperators.DelayModLFO:
                this.delayModLFO = amount.shortAmount;
                break;
            case GenOperators.FreqModLFO:
                this.freqModLFO = amount.shortAmount;
                break;
            case GenOperators.DelayVibLFO:
                this.delayVibLFO = amount.shortAmount;
                break;
            case GenOperators.FreqVibLFO:
                this.freqVibLFO = amount.shortAmount;
                break;
            case GenOperators.DelayModEnv:
                this.modEnv.delay = amount.shortAmount;
                break;
            case GenOperators.AttackModEnv:
                this.modEnv.attack = amount.shortAmount;
                break;
            case GenOperators.HoldModEnv:
                this.modEnv.hold = amount.shortAmount;
                break;
            case GenOperators.DecayModEnv:
                this.modEnv.decay = amount.shortAmount;
                break;
            case GenOperators.SustainModEnv:
                this.modEnv.sustain = amount.shortAmount;
                break;
            case GenOperators.ReleaseModEnv:
                this.modEnv.release = amount.shortAmount;
                break;
            case GenOperators.KeynumToModEnvHold:
                this.modEnv.keynumToHold = amount.shortAmount;
                break;
            case GenOperators.KeynumToModEnvDecay:
                this.modEnv.keynumToDecay = amount.shortAmount;
                break;
            case GenOperators.DelayVolEnv:
                this.ampEnv.delay = amount.shortAmount;
                break;
            case GenOperators.AttackVolEnv:
                this.ampEnv.attack = amount.shortAmount;
                break;
            case GenOperators.HoldVolEnv:
                this.ampEnv.hold = amount.shortAmount;
                break;
            case GenOperators.DecayVolEnv:
                this.ampEnv.decay = amount.shortAmount;
                break;
            case GenOperators.SustainVolEnv:
                this.ampEnv.sustain = amount.shortAmount;
                break;
            case GenOperators.ReleaseVolEnv:
                this.ampEnv.release = amount.shortAmount;
                break;
            case GenOperators.KeynumToVolEnvHold:
                this.ampEnv.keynumToHold = amount.shortAmount;
                break;
            case GenOperators.KeynumToVolEnvDecay:
                this.ampEnv.keynumToDecay = amount.shortAmount;
                break;
            case GenOperators.KeyRange:
                this.loKey = amount.lowByteAmount;
                this.hiKey = amount.highByteAmount;
                break;
            case GenOperators.VelRange:
                this.loVel = amount.lowByteAmount;
                this.hiVel = amount.highByteAmount;
                break;
            case GenOperators.StartloopAddrsCoarseOffset:
                this.loopStart += TypeConversions.int16ToUint32(amount.shortAmount) * 32768;
                break;
            case GenOperators.InitialAttenuation:
                this.attenuation += amount.shortAmount * 0.1;
                break;
            case GenOperators.EndloopAddrsCoarseOffset:
                this.loopEnd += TypeConversions.int16ToUint32(amount.shortAmount) * 32768;
                break;
            case GenOperators.CoarseTune:
                this.transpose += amount.shortAmount;
                break;
            case GenOperators.FineTune:
                this.tune += amount.shortAmount;
                break;
            case GenOperators.SampleModes:
                this.loopMode =
                    (amount.wordAmount & 3) === 3
                        ? LoopMode.Sustain
                        : (amount.wordAmount & 3) === 1
                          ? LoopMode.Continuous
                          : LoopMode.None;
                break;
            case GenOperators.ScaleTuning:
                this.pitchKeyTrack = amount.shortAmount;
                break;
            case GenOperators.ExclusiveClass:
                this.group = amount.wordAmount;
                break;
            case GenOperators.OverridingRootKey:
                this.pitchKeyCenter = amount.shortAmount;
                break;
        }
    }
}
