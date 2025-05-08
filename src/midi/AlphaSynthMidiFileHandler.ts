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
} from '@src/midi/MidiEvent';
import type { IMidiFileHandler } from '@src/midi/IMidiFileHandler';
import { type MidiFile, MidiFileFormat } from '@src/midi/MidiFile';
import { SynthConstants } from '@src/synth/SynthConstants';
import type { ControllerType } from '@src/midi/ControllerType';

/**
 * This implementation of the {@link IMidiFileHandler}
 * generates a {@link MidiFile} object which can be used in AlphaSynth for playback.
 */
export class AlphaSynthMidiFileHandler implements IMidiFileHandler {
    private _midiFile: MidiFile;
    private _smf1Mode: boolean;

    /**
     * Initializes a new instance of the {@link AlphaSynthMidiFileHandler} class.
     * @param midiFile The midi file.
     * @param smf1Mode Whether to generate a SMF1 compatible midi file. This might break multi note bends.
     */
    public constructor(midiFile: MidiFile, smf1Mode: boolean = false) {
        this._midiFile = midiFile;
        this._smf1Mode = smf1Mode;
    }

    public addTimeSignature(tick: number, timeSignatureNumerator: number, timeSignatureDenominator: number): void {
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
        if (!this._smf1Mode) {
            this._midiFile.addEvent(new AlphaTabRestEvent(track, tick, channel));
        }
    }

    public addNote(track: number, start: number, length: number, key: number, velocity: number, channel: number): void {
        this._midiFile.addEvent(
            new NoteOnEvent(
                track,
                start,
                channel,
                AlphaSynthMidiFileHandler.fixValue(key),
                AlphaSynthMidiFileHandler.fixValue(velocity)
            )
        );

        this._midiFile.addEvent(
            new NoteOffEvent(
                track,
                start + length,
                channel,
                AlphaSynthMidiFileHandler.fixValue(key),
                AlphaSynthMidiFileHandler.fixValue(velocity)
            )
        );
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

    public addControlChange(
        track: number,
        tick: number,
        channel: number,
        controller: ControllerType,
        value: number
    ): void {
        this._midiFile.addEvent(
            new ControlChangeEvent(track, tick, channel, controller, AlphaSynthMidiFileHandler.fixValue(value))
        );
    }

    public addProgramChange(track: number, tick: number, channel: number, program: number): void {
        this._midiFile.addEvent(new ProgramChangeEvent(track, tick, channel, program));
    }

    public addTempo(tick: number, tempo: number): void {
        // bpm -> microsecond per quarter note
        const tempoEvent = new TempoChangeEvent(tick, 0);
        tempoEvent.beatsPerMinute = tempo;
        this._midiFile.addEvent(tempoEvent);
    }

    public addBend(track: number, tick: number, channel: number, value: number): void {
        if (value >= SynthConstants.MaxPitchWheel) {
            value = SynthConstants.MaxPitchWheel;
        } else {
            value = Math.floor(value);
        }
        this._midiFile.addEvent(new PitchBendEvent(track, tick, channel, value));
    }

    public addNoteBend(track: number, tick: number, channel: number, key: number, value: number): void {
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
        if (this._midiFile.format === MidiFileFormat.MultiTrack || track === 0) {
            this._midiFile.addEvent(new EndOfTrackEvent(track, tick));
        }
    }
}
