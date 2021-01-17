// The SoundFont loading and Audio Synthesis is based on TinySoundFont, licensed under MIT,
// developed by Bernhard Schelling (https://github.com/schellingb/TinySoundFont)
// TypeScript port for alphaTab: (C) 2020 by Daniel Kuschny
// Licensed under: MPL-2.0
import { MidiEvent, MidiEventType } from '@src/midi/MidiEvent';
import {
    Hydra,
    HydraIbag,
    HydraIgen,
    HydraInst,
    HydraPbag,
    HydraPgen,
    HydraPhdr,
    HydraShdr
} from '@src/synth/soundfont/Hydra';
import { Channel } from '@src/synth/synthesis/Channel';
import { Channels } from '@src/synth/synthesis/Channels';
import { LoopMode } from '@src/synth/synthesis/LoopMode';
import { OutputMode } from '@src/synth/synthesis/OutputMode';
import { Preset } from '@src/synth/synthesis/Preset';
import { Region } from '@src/synth/synthesis/Region';
import { SynthEvent } from '@src/synth/synthesis/SynthEvent';
import { Voice } from '@src/synth/synthesis/Voice';
import { VoiceEnvelopeSegment } from '@src/synth/synthesis/VoiceEnvelope';
import { SynthHelper } from '@src/synth/SynthHelper';
import { TypeConversions } from '@src/io/TypeConversions';
import { Logger } from '@src/Logger';
import { SynthConstants } from '@src/synth/SynthConstants';
import { Midi20PerNotePitchBendEvent } from '@src/midi/Midi20PerNotePitchBendEvent';
import { MetaEventType } from '@src/midi/MetaEvent';
import { MetaNumberEvent } from '@src/midi/MetaNumberEvent';
import { MetaDataEvent } from '@src/midi/MetaDataEvent';
import { Queue } from '../ds/Queue';

/**
 * This is a tiny soundfont based synthesizer.
 * NOT YET IMPLEMENTED
 *   - Support for ChorusEffectsSend and ReverbEffectsSend generators
 *   - Better low-pass filter without lowering performance too much
 *   - Support for modulators
 */
export class TinySoundFont {
    private _midiEventQueue: Queue<SynthEvent> = new Queue<SynthEvent>();
    private _mutedChannels: Map<number, boolean> = new Map<number, boolean>();
    private _soloChannels: Map<number, boolean> = new Map<number, boolean>();
    private _isAnySolo: boolean = false;

    public currentTempo: number = 0;
    public timeSignatureNumerator: number = 0;
    public timeSignatureDenominator: number = 0;

    public constructor(sampleRate: number) {
        this.outSampleRate = sampleRate;
    }

    public synthesize(buffer: Float32Array, bufferPos: number, sampleCount: number): SynthEvent[] {
        return this.fillWorkingBuffer(buffer, bufferPos, sampleCount);
    }

    public synthesizeSilent(sampleCount: number): void {
        this.fillWorkingBuffer(null, 0, sampleCount);
    }

    public channelGetMixVolume(channel: number): number {
        return this._channels && channel < this._channels.channelList.length
            ? this._channels.channelList[channel].mixVolume
            : 1.0;
    }

    public channelSetMixVolume(channel: number, volume: number): void {
        let c: Channel = this.channelInit(channel);
        for (let v of this._voices) {
            if (v.playingChannel === channel && v.playingPreset !== -1) {
                v.mixVolume = volume;
            }
        }
        c.mixVolume = volume;
    }

    public channelSetMute(channel: number, mute: boolean): void {
        if (mute) {
            this._mutedChannels.set(channel, true);
        } else {
            this._mutedChannels.delete(channel);
        }
    }

    public channelSetSolo(channel: number, solo: boolean): void {
        if (solo) {
            this._soloChannels.set(channel, true);
        } else {
            this._soloChannels.delete(channel);
        }
        this._isAnySolo = this._soloChannels.size > 0;
    }

    public resetChannelStates(): void {
        this._mutedChannels = new Map<number, boolean>();
        this._soloChannels = new Map<number, boolean>();
        this._isAnySolo = false;
    }

    public dispatchEvent(synthEvent: SynthEvent): void {
        this._midiEventQueue.enqueue(synthEvent);
    }

    private fillWorkingBuffer(buffer: Float32Array | null, bufferPos: number, sampleCount: number): SynthEvent[] {
        // Break the process loop into sections representing the smallest timeframe before the midi controls need to be updated
        // the bigger the timeframe the more efficent the process is, but playback quality will be reduced.
        const anySolo: boolean = this._isAnySolo;

        const processedEvents: SynthEvent[] = [];

        // process in micro-buffers
        // process events for first microbuffer
        while (!this._midiEventQueue.isEmpty) {
            let m: SynthEvent = this._midiEventQueue.dequeue();
            if (m.isMetronome && this.metronomeVolume > 0) {
                this.channelNoteOff(SynthConstants.MetronomeChannel, 33);
                this.channelNoteOn(SynthConstants.MetronomeChannel, 33, 95 / 127);
            } else if (m.event) {
                this.processMidiMessage(m.event);
            }
            processedEvents.push(m);
        }

        // voice processing loop
        for (const voice of this._voices) {
            if (voice.playingPreset !== -1) {
                const channel: number = voice.playingChannel;
                // channel is muted if it is either explicitley muted, or another channel is set to solo but not this one.
                // exception. metronome is implicitly added in solo
                const isChannelMuted: boolean = this._mutedChannels.has(channel)
                    || (anySolo && channel != SynthConstants.MetronomeChannel && !this._soloChannels.has(channel));

                if (!buffer) {
                    voice.kill();
                } else {
                    voice.render(this, buffer, bufferPos, sampleCount, isChannelMuted);
                }
            }
        }

        return processedEvents;
    }

    private processMidiMessage(e: MidiEvent): void {
        Logger.debug('Midi', 'Processing midi ' + e.command);
        const command: MidiEventType = e.command;
        const channel: number = e.channel;
        const data1: number = e.data1;
        const data2: number = e.data2;
        switch (command) {
            case MidiEventType.NoteOff:
                this.channelNoteOff(channel, data1);
                break;
            case MidiEventType.NoteOn:
                this.channelNoteOn(channel, data1, data2 / 127.0);
                break;
            case MidiEventType.NoteAftertouch:
                break;
            case MidiEventType.Controller:
                this.channelMidiControl(channel, data1, data2);
                break;
            case MidiEventType.ProgramChange:
                this.channelSetPresetNumber(channel, data1, channel === 9);
                break;
            case MidiEventType.ChannelAftertouch:
                break;
            case MidiEventType.PitchBend:
                this.channelSetPitchWheel(channel, data1 | (data2 << 7));
                break;
            case MidiEventType.PerNotePitchBend:
                const midi20 = e as Midi20PerNotePitchBendEvent;
                let perNotePitchWheel = midi20.pitch;
                // midi 2.0 -> midi 1.0
                perNotePitchWheel = (perNotePitchWheel * SynthConstants.MaxPitchWheel) / SynthConstants.MaxPitchWheel20;
                this.channelSetPerNotePitchWheel(channel, midi20.noteKey, perNotePitchWheel);
                break;
            case MidiEventType.Meta:
                switch (e.data1 as MetaEventType) {
                    case MetaEventType.Tempo:
                        this.currentTempo = 60000000 / (e as MetaNumberEvent).value;
                        break;
                    case MetaEventType.TimeSignature:
                        this.timeSignatureNumerator = (e as MetaDataEvent).data[0];
                        this.timeSignatureDenominator = Math.pow(2, (e as MetaDataEvent).data[1]);
                        break;
                }
                break;
        }
    }

    public get metronomeVolume(): number {
        return this.channelGetMixVolume(SynthConstants.MetronomeChannel);
    }

    public set metronomeVolume(value: number) {
        this.setupMetronomeChannel(value);
    }

    public setupMetronomeChannel(volume: number): void {
        this.channelSetMixVolume(SynthConstants.MetronomeChannel, volume);
        if (volume > 0) {
            this.channelSetVolume(SynthConstants.MetronomeChannel, 1);
            this.channelSetPresetNumber(SynthConstants.MetronomeChannel, 0, true);
        }
    }


    public get masterVolume(): number {
        return SynthHelper.decibelsToGain(this.globalGainDb);
    }

    public set masterVolume(value: number) {
        var gainDb = SynthHelper.gainToDecibels(value);
        const gainDBChange: number = gainDb - this.globalGainDb;
        if (gainDBChange === 0) {
            return;
        }

        for (const v of this._voices) {
            if (v.playingPreset !== -1) {
                v.noteGainDb += gainDBChange;
            }
        }

        this.globalGainDb = gainDb;
    }

    /**
     * Stop all playing notes immediatly and reset all channel parameters but keeps user
     * defined settings
     */
    public resetSoft(): void {
        for (const v of this._voices) {
            if (
                v.playingPreset !== -1 &&
                (v.ampEnv.segment < VoiceEnvelopeSegment.Release || v.ampEnv.parameters!.release !== 0)
            ) {
                v.endQuick(this.outSampleRate);
            }
        }

        if (this._channels) {
            for (const c of this._channels.channelList) {
                c.presetIndex = c.bank = 0;
                c.pitchWheel = c.midiPan = 8192;
                c.perNotePitchWheel.clear();
                c.midiVolume = c.midiExpression = 16383;
                c.midiRpn = 0xffff;
                c.midiData = 0;
                c.panOffset = 0.0;
                c.gainDb = 0.0;
                c.pitchRange = 2.0;
                c.tuning = 0.0;
            }
        }
    }

    public presets: Preset[] | null = null;
    private _voices: Voice[] = [];
    private _channels: Channels | null = null;
    private _voicePlayIndex: number = 0;

    public get presetCount(): number {
        return this.presets?.length ?? 0;
    }

    /**
     * Gets the currently configured output mode.
     */
    public outputMode: OutputMode = OutputMode.StereoInterleaved;

    /**
     * Gets the currently configured sample rate.
     */
    public outSampleRate: number = 0;

    /**
     * Gets the currently configured global gain in DB.
     */
    public globalGainDb: number = 0;

    /**
     * Stop all playing notes immediatly and reset all channel parameters
     */
    public reset(): void {
        for (let v of this._voices) {
            if (
                v.playingPreset !== -1 &&
                (v.ampEnv.segment < VoiceEnvelopeSegment.Release || v.ampEnv.parameters!.release !== 0)
            ) {
                v.endQuick(this.outSampleRate);
            }
        }
        this._channels = null;
    }

    /**
     * Setup the parameters for the voice render methods
     * @param outputMode if mono or stereo and how stereo channel data is ordered
     * @param sampleRate the number of samples per second (output frequency)
     * @param globalGainDb volume gain in decibels (>0 means higher, <0 means lower)
     */
    public setOutput(outputMode: OutputMode, sampleRate: number, globalGainDb: number): void {
        this.outputMode = outputMode;
        this.outSampleRate = sampleRate >= 1 ? sampleRate : 44100.0;
        this.globalGainDb = globalGainDb;
    }

    /**
     * Start playing a note
     * @param presetIndex preset index >= 0 and < {@link presetCount}
     * @param key note value between 0 and 127 (60 being middle C)
     * @param vel velocity as a float between 0.0 (equal to note off) and 1.0 (full)
     */
    public noteOn(presetIndex: number, key: number, vel: number): void {
        if (!this.presets) {
            return;
        }

        const midiVelocity: number = (vel * 127) | 0;
        if (presetIndex < 0 || presetIndex >= this.presets.length) {
            return;
        }

        if (vel <= 0.0) {
            this.noteOff(presetIndex, key);
            return;
        }

        // Play all matching regions.
        const voicePlayIndex: number = this._voicePlayIndex++;
        for (const region of this.presets[presetIndex].regions!) {
            if (
                key < region.loKey ||
                key > region.hiKey ||
                midiVelocity < region.loVel ||
                midiVelocity > region.hiVel
            ) {
                continue;
            }
            let voice: Voice | null = null;
            if (region.group !== 0) {
                for (const v of this._voices) {
                    if (v.playingPreset === presetIndex && v.region!.group === region.group) {
                        v.endQuick(this.outSampleRate);
                    } else if (v.playingPreset === -1 && !voice) {
                        voice = v;
                    }
                }
            } else {
                for (let v of this._voices) {
                    if (v.playingPreset === -1) {
                        voice = v;
                    }
                }
            }

            if (!voice) {
                for (let i: number = 0; i < 4; i++) {
                    const newVoice: Voice = new Voice();
                    newVoice.playingPreset = -1;
                    this._voices.push(newVoice);
                }
                voice = this._voices[this._voices.length - 4];
            }

            voice.region = region;
            voice.playingPreset = presetIndex;
            voice.playingKey = key;
            voice.playIndex = voicePlayIndex;
            voice.noteGainDb = this.globalGainDb - region.attenuation - SynthHelper.gainToDecibels(1.0 / vel);

            if (this._channels) {
                this._channels.setupVoice(this, voice);
            } else {
                voice.calcPitchRatio(0, this.outSampleRate);
                // The SFZ spec is silent about the pan curve, but a 3dB pan law seems common. This sqrt() curve matches what Dimension LE does; Alchemy Free seems closer to sin(adjustedPan * pi/2).
                voice.panFactorLeft = Math.sqrt(0.5 - region.pan);
                voice.panFactorRight = Math.sqrt(0.5 + region.pan);
            }

            // Offset/end.
            voice.sourceSamplePosition = region.offset;

            // Loop.
            const doLoop: boolean = region.loopMode !== LoopMode.None && region.loopStart < region.loopEnd;
            voice.loopStart = doLoop ? region.loopStart : 0;
            voice.loopEnd = doLoop ? region.loopEnd : 0;

            // Setup envelopes.
            voice.ampEnv.setup(region.ampEnv, key, midiVelocity, true, this.outSampleRate);
            voice.modEnv.setup(region.modEnv, key, midiVelocity, false, this.outSampleRate);

            // Setup lowpass filter.
            const filterQDB: number = region.initialFilterQ / 10.0;
            voice.lowPass.qInv = 1.0 / Math.pow(10.0, filterQDB / 20.0);
            voice.lowPass.z1 = voice.lowPass.z2 = 0;
            voice.lowPass.active = region.initialFilterFc <= 13500;
            if (voice.lowPass.active) {
                voice.lowPass.setup(SynthHelper.cents2Hertz(region.initialFilterFc) / this.outSampleRate);
            }

            // Setup LFO filters.
            voice.modLfo.setup(region.delayModLFO, region.freqModLFO, this.outSampleRate);
            voice.vibLfo.setup(region.delayVibLFO, region.freqVibLFO, this.outSampleRate);
        }
    }

    /**
     * Start playing a note
     * @param bank instrument bank number (alternative to preset_index)
     * @param presetNumber preset number (alternative to preset_index)
     * @param key note value between 0 and 127 (60 being middle C)
     * @param vel velocity as a float between 0.0 (equal to note off) and 1.0 (full)
     * @returns returns false if preset does not exist, otherwise true
     */
    public bankNoteOn(bank: number, presetNumber: number, key: number, vel: number): boolean {
        let presetIndex: number = this.getPresetIndex(bank, presetNumber);
        if (presetIndex === -1) {
            return false;
        }
        this.noteOn(presetIndex, key, vel);
        return true;
    }

    /**
     * Stop playing a note
     */
    public noteOff(presetIndex: number, key: number): void {
        let matchFirst: Voice | null = null;
        let matchLast: Voice | null = null;
        let matches: Voice[] = [];
        for (let v of this._voices) {
            if (
                v.playingPreset !== presetIndex ||
                v.playingKey !== key ||
                v.ampEnv.segment >= VoiceEnvelopeSegment.Release
            ) {
                continue;
            } else if (!matchFirst || v.playIndex < matchFirst.playIndex) {
                matchFirst = v;
                matchLast = v;
                matches.push(v);
            } else if (v.playIndex === matchFirst.playIndex) {
                matchLast = v;
                matches.push(v);
            }
        }

        if (!matchFirst) {
            return;
        }
        for (const v of matches) {
            if (
                v !== matchFirst &&
                v !== matchLast &&
                (v.playIndex !== matchFirst.playIndex ||
                    v.playingPreset !== presetIndex ||
                    v.playingKey !== key ||
                    v.ampEnv.segment >= VoiceEnvelopeSegment.Release)
            ) {
                continue;
            }
            v.end(this.outSampleRate);
        }
    }

    /**
     * Stop playing a note
     * @returns returns false if preset does not exist, otherwise true
     */
    public bankNoteOff(bank: number, presetNumber: number, key: number): boolean {
        const presetIndex: number = this.getPresetIndex(bank, presetNumber);
        if (presetIndex === -1) {
            return false;
        }

        this.noteOff(presetIndex, key);
        return true;
    }

    /**
     * Stop playing all notes (end with sustain and release)
     */
    public noteOffAll(immediate: boolean): void {
        for (const voice of this._voices) {
            if (voice.playingPreset !== -1 && voice.ampEnv.segment < VoiceEnvelopeSegment.Release) {
                if (immediate) {
                    voice.endQuick(this.outSampleRate);
                } else {
                    voice.end(this.outSampleRate);
                }
            }
        }
    }

    public get activeVoiceCount(): number {
        let count: number = 0;
        for (const v of this._voices) {
            if (v.playingPreset !== -1) {
                count++;
            }
        }
        return count;
    }

    private channelInit(channel: number): Channel {
        if (this._channels && channel < this._channels.channelList.length) {
            return this._channels.channelList[channel];
        }

        if (!this._channels) {
            this._channels = new Channels();
        }

        for (let i: number = this._channels.channelList.length; i <= channel; i++) {
            let c: Channel = new Channel();
            c.presetIndex = c.bank = 0;
            c.pitchWheel = c.midiPan = 8192;
            c.midiVolume = c.midiExpression = 16383;
            c.midiRpn = 0xffff;
            c.midiData = 0;
            c.panOffset = 0.0;
            c.gainDb = 0.0;
            c.pitchRange = 2.0;
            c.tuning = 0.0;
            c.mixVolume = 1;
            this._channels.channelList.push(c);
        }

        return this._channels.channelList[channel];
    }

    /**
     * Returns the preset index from a bank and preset number, or -1 if it does not exist in the loaded SoundFont
     */
    private getPresetIndex(bank: number, presetNumber: number): number {
        if (!this.presets) {
            return -1;
        }

        // search reverse (last import wins)
        for (let i: number = this.presets.length - 1; i >= 0; i--) {
            let preset: Preset = this.presets[i];
            if (preset.presetNumber === presetNumber && preset.bank === bank) {
                return i;
            }
        }
        return -1;
    }

    /**
     * Returns the name of a preset index >= 0 and < GetPresetName()
     * @param presetIndex
     */
    public getPresetName(presetIndex: number): string | null {
        if (!this.presets) {
            return null;
        }
        return presetIndex < 0 || presetIndex >= this.presets.length ? null : this.presets[presetIndex].name;
    }

    /**
     * Returns the name of a preset by bank and preset number
     */
    public bankGetPresetName(bank: number, presetNumber: number): string | null {
        return this.getPresetName(this.getPresetIndex(bank, presetNumber));
    }

    /**
     * Start playing a note on a channel
     * @param channel channel number
     * @param key note value between 0 and 127 (60 being middle C)
     * @param vel velocity as a float between 0.0 (equal to note off) and 1.0 (full)
     */
    public channelNoteOn(channel: number, key: number, vel: number): void {
        if (!this._channels || channel > this._channels.channelList.length) {
            return;
        }

        this._channels.activeChannel = channel;
        this.noteOn(this._channels.channelList[channel].presetIndex, key, vel);
    }

    /**
     * Stop playing notes on a channel
     * @param channel channel number
     * @param key note value between 0 and 127 (60 being middle C)
     */
    public channelNoteOff(channel: number, key: number): void {
        const matches: Voice[] = [];
        let matchFirst: Voice | null = null;
        let matchLast: Voice | null = null;
        for (const v of this._voices) {
            // Find the first and last entry in the voices list with matching channel, key and look up the smallest play index
            if (
                v.playingPreset === -1 ||
                v.playingChannel !== channel ||
                v.playingKey !== key ||
                v.ampEnv.segment >= VoiceEnvelopeSegment.Release
            ) {
                continue;
            }

            if (!matchFirst || v.playIndex < matchFirst.playIndex) {
                matchFirst = matchLast = v;
                matches.push(v);
            } else if (v.playIndex === matchFirst.playIndex) {
                matchLast = v;
                matches.push(v);
            }
        }

        let c: Channel = this.channelInit(channel);
        c.perNotePitchWheel.delete(key);

        if (!matchFirst) {
            return;
        }

        for (const v of matches) {
            // Stop all voices with matching channel, key and the smallest play index which was enumerated above
            if (
                v !== matchFirst &&
                v !== matchLast &&
                (v.playIndex !== matchFirst.playIndex ||
                    v.playingPreset === -1 ||
                    v.playingChannel !== channel ||
                    v.playingKey !== key ||
                    v.ampEnv.segment >= VoiceEnvelopeSegment.Release)
            ) {
                continue;
            }

            v.end(this.outSampleRate);
        }
    }

    /**
     * Stop playing all notes on a channel with sustain and release.
     * @param channel channel number
     */
    public channelNoteOffAll(channel: number): void {
        let c: Channel = this.channelInit(channel);
        c.perNotePitchWheel.clear();

        for (const v of this._voices) {
            if (
                v.playingPreset !== -1 &&
                v.playingChannel === channel &&
                v.ampEnv.segment < VoiceEnvelopeSegment.Release
            ) {
                v.end(this.outSampleRate);
            }
        }
    }

    /**
     * Stop playing all notes on a channel immediately
     * @param channel channel number
     */
    public channelSoundsOffAll(channel: number): void {
        let c: Channel = this.channelInit(channel);
        c.perNotePitchWheel.clear();

        for (let v of this._voices) {
            if (
                v.playingPreset !== -1 &&
                v.playingChannel === channel &&
                (v.ampEnv.segment < VoiceEnvelopeSegment.Release || v.ampEnv.parameters!.release === 0)
            ) {
                v.endQuick(this.outSampleRate);
            }
        }
    }

    /**
     *
     * @param channel channel number
     * @param presetIndex preset index <= 0 and > {@link presetCount}
     */
    public channelSetPresetIndex(channel: number, presetIndex: number): void {
        this.channelInit(channel).presetIndex = TypeConversions.int32ToUint16(presetIndex);
    }

    /**
     * @param channel channel number
     * @param presetNumber preset number (alternative to preset_index)
     * @param midiDrums false for normal channels, otherwise apply MIDI drum channel rules
     * @returns return false if preset does not exist, otherwise true
     */
    public channelSetPresetNumber(channel: number, presetNumber: number, midiDrums: boolean = false): boolean {
        const c: Channel = this.channelInit(channel);
        let presetIndex: number = 0;
        if (midiDrums) {
            presetIndex = this.getPresetIndex(128 | (c.bank & 0x7fff), presetNumber);
            if (presetIndex === -1) {
                presetIndex = this.getPresetIndex(128, presetNumber);
            }
            if (presetIndex === -1) {
                presetIndex = this.getPresetIndex(128, 0);
            }
            if (presetIndex === -1) {
                presetIndex = this.getPresetIndex(c.bank & 0x7ff, presetNumber);
            }
        } else {
            presetIndex = this.getPresetIndex(c.bank & 0x7ff, presetNumber);
        }
        c.presetIndex = presetIndex;
        return (presetIndex !== -1);
    }

    /**
     * @param channel channel number
     * @param bank instrument bank number (alternative to preset_index)
     */
    public channelSetBank(channel: number, bank: number): void {
        this.channelInit(channel).bank = TypeConversions.int32ToUint16(bank);
    }

    /**
     * @param channel channel number
     * @param bank instrument bank number (alternative to preset_index)
     * @param presetNumber preset number (alternative to preset_index)
     * @returns return false if preset does not exist, otherwise true
     */
    public channelSetBankPreset(channel: number, bank: number, presetNumber: number): boolean {
        const c: Channel = this.channelInit(channel);
        const presetIndex: number = this.getPresetIndex(bank, presetNumber);
        if (presetIndex === -1) {
            return false;
        }

        c.presetIndex = TypeConversions.int32ToUint16(presetIndex);
        c.bank = TypeConversions.int32ToUint16(bank);
        return true;
    }

    /**
     * @param channel channel number
     * @param pan stereo panning value from 0.0 (left) to 1.0 (right) (default 0.5 center)
     */
    public channelSetPan(channel: number, pan: number): void {
        for (const v of this._voices) {
            if (v.playingChannel === channel && v.playingPreset !== -1) {
                let newPan: number = v.region!.pan + pan - 0.5;
                if (newPan <= -0.5) {
                    v.panFactorLeft = 1;
                    v.panFactorRight = 0;
                } else if (newPan >= 0.5) {
                    v.panFactorLeft = 0;
                    v.panFactorRight = 1;
                } else {
                    v.panFactorLeft = Math.sqrt(0.5 - newPan);
                    v.panFactorRight = Math.sqrt(0.5 + newPan);
                }
            }
        }
        this.channelInit(channel).panOffset = pan - 0.5;
    }

    /**
     * @param channel channel number
     * @param volume linear volume scale factor (default 1.0 full)
     */
    public channelSetVolume(channel: number, volume: number): void {
        const c: Channel = this.channelInit(channel);
        const gainDb: number = SynthHelper.gainToDecibels(volume);
        const gainDBChange: number = gainDb - c.gainDb;
        if (gainDBChange === 0) {
            return;
        }

        for (const v of this._voices) {
            if (v.playingChannel === channel && v.playingPreset !== -1) {
                v.noteGainDb += gainDBChange;
            }
        }

        c.gainDb = gainDb;
    }

    /**
     * @param channel channel number
     * @param pitchWheel pitch wheel position 0 to 16383 (default 8192 unpitched)
     */
    public channelSetPitchWheel(channel: number, pitchWheel: number): void {
        const c: Channel = this.channelInit(channel);
        if (c.pitchWheel === pitchWheel) {
            return;
        }

        c.pitchWheel = TypeConversions.int32ToUint16(pitchWheel);
        this.channelApplyPitch(channel, c);
    }

    /**
     * @param channel channel number
     * @param key note value between 0 and 127
     * @param pitchWheel pitch wheel position 0 to 16383 (default 8192 unpitched)
     */
    public channelSetPerNotePitchWheel(channel: number, key: number, pitchWheel: number): void {
        const c: Channel = this.channelInit(channel);
        if (c.perNotePitchWheel.has(key) && c.perNotePitchWheel.get(key) === pitchWheel) {
            return;
        }

        c.perNotePitchWheel.set(key, pitchWheel);
        this.channelApplyPitch(channel, c, key);
    }

    private channelApplyPitch(channel: number, c: Channel, key: number = -1): void {
        for (const v of this._voices) {
            if (v.playingChannel === channel && v.playingPreset !== -1 && (key == -1 || v.playingKey === key)) {
                v.updatePitchRatio(c, this.outSampleRate);
            }
        }
    }

    /**
     * @param channel channel number
     * @param pitchRange range of the pitch wheel in semitones (default 2.0, total +/- 2 semitones)
     */
    public channelSetPitchRange(channel: number, pitchRange: number): void {
        const c: Channel = this.channelInit(channel);
        if (c.pitchRange === pitchRange) {
            return;
        }

        c.pitchRange = pitchRange;
        if (c.pitchWheel !== 8192) {
            this.channelApplyPitch(channel, c);
        }
    }

    /**
     * @param channel channel number
     * @param tuning tuning of all playing voices in semitones (default 0.0, standard (A440) tuning)
     */
    public channelSetTuning(channel: number, tuning: number): void {
        const c: Channel = this.channelInit(channel);
        if (c.tuning === tuning) {
            return;
        }

        c.tuning = tuning;
        this.channelApplyPitch(channel, c);
    }

    /**
     * Apply a MIDI control change to the channel (not all controllers are supported!)
     */
    public channelMidiControl(channel: number, controller: number, controlValue: number): void {
        let c: Channel = this.channelInit(channel);
        switch (controller) {
            case 5: /*Portamento_Time_MSB*/
            case 96: /*DATA_BUTTON_INCREMENT*/
            case 97: /*DATA_BUTTON_DECREMENT*/
            case 64: /*HOLD_PEDAL*/
            case 65: /*Portamento*/
            case 66: /*SostenutoPedal */
            case 122: /*LocalKeyboard */
            case 124: /*OmniModeOff */
            case 125: /*OmniModeon */
            case 126: /*MonoMode */
            case 127 /*PolyMode*/:
                return;

            case 38 /*DATA_ENTRY_LSB*/:
                c.midiData = TypeConversions.int32ToUint16((c.midiData & 0x3f80) | controlValue);

                if (c.midiRpn === 0) {
                    this.channelSetPitchRange(channel, (c.midiData >> 7) + 0.01 * (c.midiData & 0x7f));
                } else if (c.midiRpn === 1) {
                    this.channelSetTuning(channel, (c.tuning | 0) + (c.midiData - 8192.0) / 8192.0); // fine tune
                } else if (c.midiRpn === 2) {
                    this.channelSetTuning(channel, controlValue - 64.0 + (c.tuning - (c.tuning | 0))); // coarse tune
                }
                return;

            case 7 /*VOLUME_MSB*/:
                c.midiVolume = TypeConversions.int32ToUint16((c.midiVolume & 0x7f) | (controlValue << 7));
                // Raising to the power of 3 seems to result in a decent sounding volume curve for MIDI
                this.channelSetVolume(channel, Math.pow((c.midiVolume / 16383.0) * (c.midiExpression / 16383.0), 3.0));
                return;
            case 39 /*VOLUME_LSB*/:
                c.midiVolume = TypeConversions.int32ToUint16((c.midiVolume & 0x3f80) | controlValue);
                // Raising to the power of 3 seems to result in a decent sounding volume curve for MIDI
                this.channelSetVolume(channel, Math.pow((c.midiVolume / 16383.0) * (c.midiExpression / 16383.0), 3.0));
                return;
            case 11 /*EXPRESSION_MSB*/:
                c.midiExpression = TypeConversions.int32ToUint16((c.midiExpression & 0x7f) | (controlValue << 7));
                // Raising to the power of 3 seems to result in a decent sounding volume curve for MIDI
                this.channelSetVolume(channel, Math.pow((c.midiVolume / 16383.0) * (c.midiExpression / 16383.0), 3.0));
                return;
            case 43 /*EXPRESSION_LSB*/:
                c.midiExpression = TypeConversions.int32ToUint16((c.midiExpression & 0x3f80) | controlValue);
                // Raising to the power of 3 seems to result in a decent sounding volume curve for MIDI
                this.channelSetVolume(channel, Math.pow((c.midiVolume / 16383.0) * (c.midiExpression / 16383.0), 3.0));
                return;
            case 10 /*PAN_MSB*/:
                c.midiPan = TypeConversions.int32ToUint16((c.midiPan & 0x7f) | (controlValue << 7));
                this.channelSetPan(channel, c.midiPan / 16383.0);
                return;
            case 42 /*PAN_LSB*/:
                c.midiPan = TypeConversions.int32ToUint16((c.midiPan & 0x3f80) | controlValue);
                this.channelSetPan(channel, c.midiPan / 16383.0);
                return;
            case 6 /*DATA_ENTRY_MSB*/:
                c.midiData = TypeConversions.int32ToUint16((c.midiData & 0x7f) | (controlValue << 7));
                if (c.midiRpn === 0) {
                    this.channelSetPitchRange(channel, (c.midiData >> 7) + 0.01 * (c.midiData & 0x7f));
                } else if (c.midiRpn === 1) {
                    this.channelSetTuning(channel, (c.tuning | 0) + (c.midiData - 8192.0) / 8192.0); // fine tune
                } else if (c.midiRpn === 2 && controller === 6) {
                    this.channelSetTuning(channel, controlValue - 64.0 + (c.tuning - (c.tuning | 0))); // coarse tune
                }
                return;
            case 0 /*BANK_SELECT_MSB*/:
                c.bank = TypeConversions.int32ToUint16(0x8000 | controlValue);
                return;
            // bank select MSB alone acts like LSB
            case 32 /*BANK_SELECT_LSB*/:
                c.bank = TypeConversions.int32ToUint16(
                    ((c.bank & 0x8000) !== 0 ? (c.bank & 0x7f) << 7 : 0) | controlValue
                );
                return;
            case 101 /*RPN_MSB*/:
                c.midiRpn = TypeConversions.int32ToUint16(
                    ((c.midiRpn === 0xffff ? 0 : c.midiRpn) & 0x7f) | (controlValue << 7)
                );
                // TODO
                return;
            case 100 /*RPN_LSB*/:
                c.midiRpn = TypeConversions.int32ToUint16(
                    ((c.midiRpn === 0xffff ? 0 : c.midiRpn) & 0x3f80) | controlValue
                );
                // TODO
                return;
            case 98 /*NRPN_LSB*/:
                c.midiRpn = 0xffff;
                // TODO
                return;
            case 99 /*NRPN_MSB*/:
                c.midiRpn = 0xffff;
                // TODO
                return;
            case 120 /*ALL_SOUND_OFF*/:
                this.channelSoundsOffAll(channel);
                return;
            case 123 /*ALL_NOTES_OFF*/:
                this.channelNoteOffAll(channel);
                return;
            case 121 /*ALL_CTRL_OFF*/:
                c.midiVolume = c.midiExpression = 16383;
                c.midiPan = 8192;
                c.bank = 0;
                this.channelSetVolume(channel, 1);
                this.channelSetPan(channel, 0.5);
                this.channelSetPitchRange(channel, 2);
                // TODO
                return;
        }
    }

    /**
     * Gets the current preset index of the given channel.
     * @param channel The channel index
     * @returns The current preset index of the given channel.
     */
    public channelGetPresetIndex(channel: number): number {
        return this._channels && channel < this._channels.channelList.length
            ? this._channels.channelList[channel].presetIndex
            : 0;
    }

    /**
     * Gets the current bank of the given channel.
     * @param channel The channel index
     * @returns The current bank of the given channel.
     */
    public channelGetPresetBank(channel: number): number {
        return this._channels && channel < this._channels.channelList.length
            ? this._channels.channelList[channel].bank & 0x7fff
            : 0;
    }

    /**
     * Gets the current pan of the given channel.
     * @param channel The channel index
     * @returns The current pan of the given channel.
     */
    public channelGetPan(channel: number): number {
        return this._channels && channel < this._channels.channelList.length
            ? this._channels.channelList[channel].panOffset - 0.5
            : 0.5;
    }

    /**
     * Gets the current volume of the given channel.
     * @param channel The channel index
     * @returns The current volune of the given channel.
     */
    public channelGetVolume(channel: number): number {
        return this._channels && channel < this._channels.channelList.length
            ? SynthHelper.decibelsToGain(this._channels.channelList[channel].gainDb)
            : 1.0;
    }

    /**
     * Gets the current pitch wheel of the given channel.
     * @param channel The channel index
     * @returns The current pitch wheel of the given channel.
     */
    public channelGetPitchWheel(channel: number): number {
        return this._channels && channel < this._channels.channelList.length
            ? this._channels.channelList[channel].pitchWheel
            : 8192;
    }

    /**
     * Gets the current pitch range of the given channel.
     * @param channel The channel index
     * @returns The current pitch range of the given channel.
     */
    public channelGetPitchRange(channel: number): number {
        return this._channels && channel < this._channels.channelList.length
            ? this._channels.channelList[channel].pitchRange
            : 2.0;
    }

    /**
     * Gets the current tuning of the given channel.
     * @param channel The channel index
     * @returns The current tuning of the given channel.
     */
    public channelGetTuning(channel: number): number {
        return this._channels && channel < this._channels.channelList.length
            ? this._channels.channelList[channel].tuning
            : 0.0;
    }

    public resetPresets(): void {
        this.presets = [];
    }

    public loadPresets(hydra: Hydra, append: boolean): void {
        const newPresets = new Array<Preset>(hydra.phdrs.length - 1);
        for (let phdrIndex: number = 0; phdrIndex < hydra.phdrs.length - 1; phdrIndex++) {
            const phdr: HydraPhdr = hydra.phdrs[phdrIndex];
            let regionIndex: number = 0;

            const preset: Preset = (newPresets[phdrIndex] = new Preset());
            preset.name = phdr.presetName;
            preset.bank = phdr.bank;
            preset.presetNumber = phdr.preset;
            preset.fontSamples = hydra.fontSamples;
            let regionNum: number = 0;

            for (
                let pbagIndex: number = phdr.presetBagNdx;
                pbagIndex < hydra.phdrs[phdrIndex + 1].presetBagNdx;
                pbagIndex++
            ) {
                const pbag: HydraPbag = hydra.pbags[pbagIndex];
                let plokey: number = 0;
                let phikey: number = 127;
                let plovel: number = 0;
                let phivel: number = 127;

                for (let pgenIndex: number = pbag.genNdx; pgenIndex < hydra.pbags[pbagIndex + 1].genNdx; pgenIndex++) {
                    let pgen: HydraPgen = hydra.pgens[pgenIndex];

                    if (pgen.genOper === HydraPgen.GenKeyRange) {
                        plokey = pgen.genAmount.lowByteAmount;
                        phikey = pgen.genAmount.highByteAmount;
                        continue;
                    }

                    if (pgen.genOper === HydraPgen.GenVelRange) {
                        plovel = pgen.genAmount.lowByteAmount;
                        phivel = pgen.genAmount.highByteAmount;
                        continue;
                    }

                    if (pgen.genOper !== HydraPgen.GenInstrument) {
                        continue;
                    }

                    if (pgen.genAmount.wordAmount >= hydra.insts.length) {
                        continue;
                    }

                    let pinst: HydraInst = hydra.insts[pgen.genAmount.wordAmount];
                    for (
                        let ibagIndex: number = pinst.instBagNdx;
                        ibagIndex < hydra.insts[pgen.genAmount.wordAmount + 1].instBagNdx;
                        ibagIndex++
                    ) {
                        let ibag: HydraIbag = hydra.ibags[ibagIndex];

                        let ilokey: number = 0;
                        let ihikey: number = 127;
                        let ilovel: number = 0;
                        let ihivel: number = 127;

                        for (
                            let igenIndex: number = ibag.instGenNdx;
                            igenIndex < hydra.ibags[ibagIndex + 1].instGenNdx;
                            igenIndex++
                        ) {
                            let igen: HydraIgen = hydra.igens[igenIndex];
                            if (igen.genOper === HydraPgen.GenKeyRange) {
                                ilokey = igen.genAmount.lowByteAmount;
                                ihikey = igen.genAmount.highByteAmount;
                                continue;
                            }

                            if (igen.genOper === HydraPgen.GenVelRange) {
                                ilovel = igen.genAmount.lowByteAmount;
                                ihivel = igen.genAmount.highByteAmount;
                                continue;
                            }

                            if (
                                igen.genOper === 53 &&
                                ihikey >= plokey &&
                                ilokey <= phikey &&
                                ihivel >= plovel &&
                                ilovel <= phivel
                            ) {
                                regionNum++;
                            }
                        }
                    }
                }
            }

            preset.regions = new Array<Region>(regionNum);

            let globalRegion: Region = new Region();
            globalRegion.clear(true);

            // Zones.
            for (
                let pbagIndex: number = phdr.presetBagNdx;
                pbagIndex < hydra.phdrs[phdrIndex + 1].presetBagNdx;
                pbagIndex++
            ) {
                const pbag: HydraPbag = hydra.pbags[pbagIndex];

                const presetRegion: Region = new Region(globalRegion);
                let hadGenInstrument: boolean = false;

                // Generators.
                for (let pgenIndex: number = pbag.genNdx; pgenIndex < hydra.pbags[pbagIndex + 1].genNdx; pgenIndex++) {
                    const pgen: HydraPgen = hydra.pgens[pgenIndex];

                    // Instrument.
                    if (pgen.genOper === HydraPgen.GenInstrument) {
                        let whichInst: number = pgen.genAmount.wordAmount;
                        if (whichInst >= hydra.insts.length) {
                            continue;
                        }

                        let instRegion: Region = new Region();
                        instRegion.clear(false);

                        // Generators
                        let inst: HydraInst = hydra.insts[whichInst];
                        for (
                            let ibagIndex: number = inst.instBagNdx;
                            ibagIndex < hydra.insts[whichInst + 1].instBagNdx;
                            ibagIndex++
                        ) {
                            let ibag: HydraIbag = hydra.ibags[ibagIndex];
                            let zoneRegion: Region = new Region(instRegion);
                            let hadSampleId: boolean = false;

                            for (
                                let igenIndex: number = ibag.instGenNdx;
                                igenIndex < hydra.ibags[ibagIndex + 1].instGenNdx;
                                igenIndex++
                            ) {
                                let igen: HydraIgen = hydra.igens[igenIndex];

                                if (igen.genOper === HydraPgen.GenSampleId) {
                                    // preset region key and vel ranges are a filter for the zone regions
                                    if (
                                        zoneRegion.hiKey < presetRegion.loKey ||
                                        zoneRegion.loKey > presetRegion.hiKey
                                    ) {
                                        continue;
                                    }

                                    if (
                                        zoneRegion.hiVel < presetRegion.loVel ||
                                        zoneRegion.loVel > presetRegion.hiVel
                                    ) {
                                        continue;
                                    }

                                    if (presetRegion.loKey > zoneRegion.loKey) {
                                        zoneRegion.loKey = presetRegion.loKey;
                                    }

                                    if (presetRegion.hiKey < zoneRegion.hiKey) {
                                        zoneRegion.hiKey = presetRegion.hiKey;
                                    }

                                    if (presetRegion.loVel > zoneRegion.loVel) {
                                        zoneRegion.loVel = presetRegion.loVel;
                                    }

                                    if (presetRegion.hiVel < zoneRegion.hiVel) {
                                        zoneRegion.hiVel = presetRegion.hiVel;
                                    }

                                    // sum regions
                                    zoneRegion.offset += presetRegion.offset;
                                    zoneRegion.end += presetRegion.end;
                                    zoneRegion.loopStart += presetRegion.loopStart;
                                    zoneRegion.loopEnd += presetRegion.loopEnd;
                                    zoneRegion.transpose += presetRegion.transpose;
                                    zoneRegion.tune += presetRegion.tune;
                                    zoneRegion.pitchKeyTrack += presetRegion.pitchKeyTrack;
                                    zoneRegion.attenuation += presetRegion.attenuation;
                                    zoneRegion.pan += presetRegion.pan;
                                    zoneRegion.ampEnv.delay += presetRegion.ampEnv.delay;
                                    zoneRegion.ampEnv.attack += presetRegion.ampEnv.attack;
                                    zoneRegion.ampEnv.hold += presetRegion.ampEnv.hold;
                                    zoneRegion.ampEnv.decay += presetRegion.ampEnv.decay;
                                    zoneRegion.ampEnv.sustain += presetRegion.ampEnv.sustain;
                                    zoneRegion.ampEnv.release += presetRegion.ampEnv.release;
                                    zoneRegion.modEnv.delay += presetRegion.modEnv.delay;
                                    zoneRegion.modEnv.attack += presetRegion.modEnv.attack;
                                    zoneRegion.modEnv.hold += presetRegion.modEnv.hold;
                                    zoneRegion.modEnv.decay += presetRegion.modEnv.decay;
                                    zoneRegion.modEnv.sustain += presetRegion.modEnv.sustain;
                                    zoneRegion.modEnv.release += presetRegion.modEnv.release;
                                    zoneRegion.initialFilterQ += presetRegion.initialFilterQ;
                                    zoneRegion.initialFilterFc += presetRegion.initialFilterFc;
                                    zoneRegion.modEnvToPitch += presetRegion.modEnvToPitch;
                                    zoneRegion.modEnvToFilterFc += presetRegion.modEnvToFilterFc;
                                    zoneRegion.delayModLFO += presetRegion.delayModLFO;
                                    zoneRegion.freqModLFO += presetRegion.freqModLFO;
                                    zoneRegion.modLfoToPitch += presetRegion.modLfoToPitch;
                                    zoneRegion.modLfoToFilterFc += presetRegion.modLfoToFilterFc;
                                    zoneRegion.modLfoToVolume += presetRegion.modLfoToVolume;
                                    zoneRegion.delayVibLFO += presetRegion.delayVibLFO;
                                    zoneRegion.freqVibLFO += presetRegion.freqVibLFO;
                                    zoneRegion.vibLfoToPitch += presetRegion.vibLfoToPitch;

                                    // EG times need to be converted from timecents to seconds.
                                    zoneRegion.ampEnv.envToSecs(true);
                                    zoneRegion.modEnv.envToSecs(false);

                                    // LFO times need to be converted from timecents to seconds.
                                    zoneRegion.delayModLFO =
                                        zoneRegion.delayModLFO < -11950.0
                                            ? 0.0
                                            : SynthHelper.timecents2Secs(zoneRegion.delayModLFO);
                                    zoneRegion.delayVibLFO =
                                        zoneRegion.delayVibLFO < -11950.0
                                            ? 0.0
                                            : SynthHelper.timecents2Secs(zoneRegion.delayVibLFO);

                                    // Pin values to their ranges.
                                    if (zoneRegion.pan < -0.5) {
                                        zoneRegion.pan = -0.5;
                                    } else if (zoneRegion.pan > 0.5) {
                                        zoneRegion.pan = 0.5;
                                    }

                                    if (zoneRegion.initialFilterQ < 1500 || zoneRegion.initialFilterQ > 13500) {
                                        zoneRegion.initialFilterQ = 0;
                                    }

                                    let shdr: HydraShdr = hydra.sHdrs[igen.genAmount.wordAmount];
                                    zoneRegion.offset += shdr.start;
                                    zoneRegion.end += shdr.end;
                                    zoneRegion.loopStart += shdr.startLoop;
                                    zoneRegion.loopEnd += shdr.endLoop;
                                    if (shdr.endLoop > 0) {
                                        zoneRegion.loopEnd -= 1;
                                    }

                                    if (zoneRegion.pitchKeyCenter === -1) {
                                        zoneRegion.pitchKeyCenter = shdr.originalPitch;
                                    }

                                    zoneRegion.tune += shdr.pitchCorrection;
                                    zoneRegion.sampleRate = shdr.sampleRate;
                                    if (zoneRegion.end !== 0 && zoneRegion.end < preset.fontSamples.length) {
                                        zoneRegion.end++;
                                    } else {
                                        zoneRegion.end = preset.fontSamples.length;
                                    }

                                    preset.regions[regionIndex] = new Region(zoneRegion);
                                    regionIndex++;

                                    hadSampleId = true;
                                } else {
                                    zoneRegion.operator(igen.genOper, igen.genAmount);
                                }
                            }

                            // Handle instrument's global zone.
                            if (ibag === hydra.ibags[inst.instBagNdx] && !hadSampleId) {
                                instRegion = new Region(zoneRegion);
                            }

                            // Modulators (TODO)
                            //if (ibag->instModNdx < ibag[1].instModNdx) addUnsupportedOpcode("any modulator");
                        }

                        hadGenInstrument = true;
                    } else {
                        presetRegion.operator(pgen.genOper, pgen.genAmount);
                    }
                }

                // Modulators (TODO)
                // if (pbag->modNdx < pbag[1].modNdx) addUnsupportedOpcode("any modulator");

                // Handle preset's global zone.
                if (pbag === hydra.pbags[phdr.presetBagNdx] && !hadGenInstrument) {
                    globalRegion = presetRegion;
                }
            }
        }

        if (!append || !this.presets) {
            this.presets = newPresets;
        } else {
            for (const preset of newPresets) {
                this.presets.push(preset);
            }
        }
    }
}
