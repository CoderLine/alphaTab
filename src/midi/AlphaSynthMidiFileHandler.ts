import { MetaDataEvent } from '@src/midi/MetaDataEvent';
import { MetaEventType } from '@src/midi/MetaEvent';
import { MetaNumberEvent } from '@src/midi/MetaNumberEvent';
import { MidiEvent, MidiEventType } from '@src/midi/MidiEvent';
import { SystemCommonType } from '@src/midi/SystemCommonEvent';
import { AlphaTabSystemExclusiveEvents, SystemExclusiveEvent } from '@src/midi/SystemExclusiveEvent';
import { IMidiFileHandler } from '@src/midi/IMidiFileHandler';
import { MidiFile } from '@src/midi/MidiFile';
import { MidiUtils } from '@src/midi/MidiUtils';
import { DynamicValue } from '@src/model/DynamicValue';
import { SynthConstants } from '@src/synth/SynthConstants';
import { Midi20PerNotePitchBendEvent } from './Midi20PerNotePitchBendEvent';

/**
 * This implementation of the {@link IMidiFileHandler}
 * generates a {@link MidiFile} object which can be used in AlphaSynth for playback.
 */
export class AlphaSynthMidiFileHandler implements IMidiFileHandler {
    private _midiFile: MidiFile;

    /**
     * Initializes a new instance of the {@link AlphaSynthMidiFileHandler} class.
     * @param midiFile The midi file.
     */
    public constructor(midiFile: MidiFile) {
        this._midiFile = midiFile;
    }

    public addTimeSignature(tick: number, timeSignatureNumerator: number, timeSignatureDenominator: number): void {
        let denominatorIndex: number = 0;
        // tslint:disable-next-line: no-conditional-assignment
        while ((timeSignatureDenominator = timeSignatureDenominator >> 1) > 0) {
            denominatorIndex++;
        }
        const message: MetaDataEvent = new MetaDataEvent(
            0,
            tick,
            0xff,
            MetaEventType.TimeSignature,
            new Uint8Array([timeSignatureNumerator & 0xff, denominatorIndex & 0xff, 48, 8])
        );
        this._midiFile.addEvent(message);
    }

    public addRest(track: number, tick: number, channel: number): void {
        const message: SystemExclusiveEvent = new SystemExclusiveEvent(
            track,
            tick,
            SystemCommonType.SystemExclusive,
            SystemExclusiveEvent.AlphaTabManufacturerId,
            new Uint8Array([AlphaTabSystemExclusiveEvents.Rest])
        );
        this._midiFile.addEvent(message);
    }

    public addNote(
        track: number,
        start: number,
        length: number,
        key: number,
        dynamicValue: DynamicValue,
        channel: number
    ): void {
        const velocity: number = MidiUtils.dynamicToVelocity(dynamicValue);
        const noteOn: MidiEvent = new MidiEvent(
            track,
            start,
            this.makeCommand(MidiEventType.NoteOn, channel),
            AlphaSynthMidiFileHandler.fixValue(key),
            AlphaSynthMidiFileHandler.fixValue(velocity)
        );
        this._midiFile.addEvent(noteOn);
        const noteOff: MidiEvent = new MidiEvent(
            track,
            start + length,
            this.makeCommand(MidiEventType.NoteOff, channel),
            AlphaSynthMidiFileHandler.fixValue(key),
            AlphaSynthMidiFileHandler.fixValue(velocity)
        );
        this._midiFile.addEvent(noteOff);
    }

    private makeCommand(command: number, channel: number): number {
        return (command & 0xf0) | (channel & 0x0f);
    }

    private static fixValue(value: number): number {
        if (value > 127) {
            return 127;
        }
        if (value < 0) {
            return 0;
        }
        return value;
    }

    public addControlChange(track: number, tick: number, channel: number, controller: number, value: number): void {
        const message: MidiEvent = new MidiEvent(
            track,
            tick,
            this.makeCommand(MidiEventType.Controller, channel),
            AlphaSynthMidiFileHandler.fixValue(controller),
            AlphaSynthMidiFileHandler.fixValue(value)
        );
        this._midiFile.addEvent(message);
    }

    public addProgramChange(track: number, tick: number, channel: number, program: number): void {
        const message: MidiEvent = new MidiEvent(
            track,
            tick,
            this.makeCommand(MidiEventType.ProgramChange, channel),
            AlphaSynthMidiFileHandler.fixValue(program),
            0
        );
        this._midiFile.addEvent(message);
    }

    public addTempo(tick: number, tempo: number): void {
        // bpm -> microsecond per quarter note
        const tempoInUsq: number = (60000000 / tempo) | 0;
        const message: MetaNumberEvent = new MetaNumberEvent(0, tick, 0xff, MetaEventType.Tempo, tempoInUsq);
        this._midiFile.addEvent(message);
    }

    public addBend(track: number, tick: number, channel: number, value: number): void {
        if (value >= SynthConstants.MaxPitchWheel) {
            value = SynthConstants.MaxPitchWheel;
        } else {
            value = Math.floor(value);
        }

        const message: MidiEvent = new MidiEvent(
            track,
            tick,
            this.makeCommand(MidiEventType.PitchBend, channel),
            value & 0x7F,
            (value >> 7) & 0x7F
        );
        this._midiFile.addEvent(message);
    }

    public addNoteBend(track: number, tick: number, channel: number, key: number, value: number): void {
        if (value >= SynthConstants.MaxPitchWheel) {
            value = SynthConstants.MaxPitchWheel;
        } else {
            value = Math.floor(value);
        }

        // map midi 1.0 range of 0-16384     (0x4000)
        // to midi 2.0 range of 0-4294967296 (0x100000000)
        value = value * SynthConstants.MaxPitchWheel20 / SynthConstants.MaxPitchWheel

        const message = new Midi20PerNotePitchBendEvent(
            track,
            tick,
            this.makeCommand(MidiEventType.PerNotePitchBend, channel),
            key,
            value
        );
        this._midiFile.addEvent(message);
    }

    public finishTrack(track: number, tick: number): void {
        const message: MetaDataEvent = new MetaDataEvent(track, tick, 0xff, MetaEventType.EndOfTrack, new Uint8Array(0));
        this._midiFile.addEvent(message);
    }
}
