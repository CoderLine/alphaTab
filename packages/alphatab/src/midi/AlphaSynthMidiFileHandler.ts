import {
    AlphaTabRestEvent,
    ControlChangeEvent,
    EndOfTrackEvent,
    NoteBendEvent,
    NoteOffEvent,
    NoteOnEvent,
    PitchBendEvent,
    ProgramChangeEvent,
    TempoChangeEvent,
    TimeSignatureEvent
} from '@coderline/alphatab/midi/MidiEvent';
import type { IMidiFileHandler } from '@coderline/alphatab/midi/IMidiFileHandler';
import { type MidiFile, MidiFileFormat } from '@coderline/alphatab/midi/MidiFile';
import { SynthConstants } from '@coderline/alphatab/synth/SynthConstants';
import type { ControllerType } from '@coderline/alphatab/midi/ControllerType';

/**
 * This implementation of the {@link IMidiFileHandler}
 * generates a {@link MidiFile} object which can be used in AlphaSynth for playback.
 * @public
 */
export class AlphaSynthMidiFileHandler implements IMidiFileHandler {
    private _midiFile: MidiFile;
    private _smf1Mode: boolean;

    /**
     * An indicator by how many midi-ticks the song contents are shifted.
     * Grace beats at start might require a shift for the first beat to start at 0.
     * This information can be used to translate back the player time axis to the music notation.
     */
    public tickShift: number = 0;

    /**
     * Initializes a new instance of the {@link AlphaSynthMidiFileHandler} class.
     * @param midiFile The midi file.
     * @param smf1Mode Whether to generate a SMF1 compatible midi file. This might break multi note bends.
     */
    public constructor(midiFile: MidiFile, smf1Mode: boolean = false) {
        this._midiFile = midiFile;
        this._smf1Mode = smf1Mode;
    }

    public addTickShift(tickShift: number) {
        this._midiFile.tickShift = tickShift;
        this.tickShift = tickShift;
    }

    public addTimeSignature(tick: number, timeSignatureNumerator: number, timeSignatureDenominator: number): void {
        tick += this.tickShift;

        let denominatorIndex: number = 0;
        let denominator = timeSignatureDenominator;
        while (true) {
            denominator = denominator >> 1;
            if (denominator > 0) {
                denominatorIndex++;
            } else {
                break;
            }
        }

        this._midiFile.addEvent(new TimeSignatureEvent(0, tick, timeSignatureNumerator, denominatorIndex, 48, 8));
    }

    public addRest(track: number, tick: number, channel: number): void {
        tick += this.tickShift;
        if (!this._smf1Mode) {
            this._midiFile.addEvent(new AlphaTabRestEvent(track, tick, channel));
        }
    }

    public addNote(track: number, start: number, length: number, key: number, velocity: number, channel: number): void {
        start += this.tickShift;
        this._midiFile.addEvent(
            new NoteOnEvent(
                track,
                start,
                channel,
                AlphaSynthMidiFileHandler._fixValue(key),
                AlphaSynthMidiFileHandler._fixValue(velocity)
            )
        );

        this._midiFile.addEvent(
            new NoteOffEvent(
                track,
                start + length,
                channel,
                AlphaSynthMidiFileHandler._fixValue(key),
                AlphaSynthMidiFileHandler._fixValue(velocity)
            )
        );
    }

    private static _fixValue(value: number): number {
        if (value > 127) {
            return 127;
        }
        if (value < 0) {
            return 0;
        }
        return value;
    }

    public addControlChange(
        track: number,
        tick: number,
        channel: number,
        controller: ControllerType,
        value: number
    ): void {
        tick += this.tickShift;
        this._midiFile.addEvent(
            new ControlChangeEvent(track, tick, channel, controller, AlphaSynthMidiFileHandler._fixValue(value))
        );
    }

    public addProgramChange(track: number, tick: number, channel: number, program: number): void {
        tick += this.tickShift;
        this._midiFile.addEvent(new ProgramChangeEvent(track, tick, channel, program));
    }

    public addTempo(tick: number, tempo: number): void {
        tick += this.tickShift;
        // bpm -> microsecond per quarter note
        const tempoEvent = new TempoChangeEvent(tick, 0);
        tempoEvent.beatsPerMinute = tempo;
        this._midiFile.addEvent(tempoEvent);
    }

    public addBend(track: number, tick: number, channel: number, value: number): void {
        tick += this.tickShift;
        if (value >= SynthConstants.MaxPitchWheel) {
            value = SynthConstants.MaxPitchWheel;
        } else {
            value = Math.floor(value);
        }
        this._midiFile.addEvent(new PitchBendEvent(track, tick, channel, value));
    }

    public addNoteBend(track: number, tick: number, channel: number, key: number, value: number): void {
        tick += this.tickShift;
        if (this._smf1Mode) {
            this.addBend(track, tick, channel, value);
        } else {
            // map midi 1.0 range of 0-16384     (0x4000)
            // to midi 2.0 range of 0-4294967296 (0x100000000)
            value = (value * SynthConstants.MaxPitchWheel20) / SynthConstants.MaxPitchWheel;

            this._midiFile.addEvent(new NoteBendEvent(track, tick, channel, key, value));
        }
    }

    public finishTrack(track: number, tick: number): void {
        tick += this.tickShift;
        if (this._midiFile.format === MidiFileFormat.MultiTrack || track === 0) {
            this._midiFile.addEvent(new EndOfTrackEvent(track, tick));
        }
    }
}
