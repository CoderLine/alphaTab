/** @target web */
import { AlphaTabError, AlphaTabErrorType } from '@coderline/alphatab/AlphaTabError';
import type { ControllerType } from '@coderline/alphatab/midi/ControllerType';
import {
    AlphaTabMetronomeEvent,
    AlphaTabRestEvent,
    ControlChangeEvent,
    EndOfTrackEvent,
    type MidiEvent,
    MidiEventType,
    NoteBendEvent,
    type NoteEvent,
    NoteOffEvent,
    NoteOnEvent,
    PitchBendEvent,
    ProgramChangeEvent,
    TempoChangeEvent,
    TimeSignatureEvent
} from '@coderline/alphatab/midi/MidiEvent';
import { MidiFile, MidiTrack } from '@coderline/alphatab/midi/MidiFile';
import type {
    IAlphaSynthWorker,
    IAlphaSynthWorkerMessage
} from '@coderline/alphatab/platform/worker/AlphaTabWorkerProtocol';
import { Environment } from '@coderline/alphatab/Environment';

/**
 * Flat numeric encoding of a {@link MidiFile} for the hand-off to the synthesizer worker,
 * decoding to the same content as {@link JsonConverter.midiFileToJsObject} followed by
 * {@link JsonConverter.jsObjectToMidiFile}.
 *
 * ```
 * file  := division, tickShift, trackCount, eventCount*, event*
 * event := type, track, tick, p0, p1, p2, p3
 * ```
 * Events are stored track after track. The parameters `p0..p3` are the type specific fields in the
 * order of the event constructors (unused ones are 0); a tempo change stores `beatsPerMinute`.
 * @target web
 * @internal
 */
export class MidiFileWire {
    private static readonly _eventSize = 7;

    /**
     * Posts `message` with its `midi` field set to the encoding of `midi`, transferring the buffer.
     * @returns always true, for use behind a web-only early return.
     */
    public static post(
        worker: IAlphaSynthWorker,
        message: IAlphaSynthWorkerMessage & { midi: unknown },
        midi: MidiFile
    ): boolean {
        const data = MidiFileWire.encode(Environment.prepareForPostMessage(midi));
        message.midi = data;
        (worker as unknown as Worker).postMessage(message, [data.buffer]);
        return true;
    }

    public static encode(midi: MidiFile): Float64Array {
        const tracks = midi.tracks;
        let eventCount = 0;
        for (const track of tracks) {
            eventCount += track.events.length;
        }
        const data = new Float64Array(3 + tracks.length + eventCount * MidiFileWire._eventSize);
        data[0] = midi.division;
        data[1] = midi.tickShift;
        data[2] = tracks.length;
        let i = 3;
        for (const track of tracks) {
            data[i++] = track.events.length;
        }
        for (const track of tracks) {
            for (const e of track.events) {
                MidiFileWire._writeEvent(data, i, e);
                i += MidiFileWire._eventSize;
            }
        }
        return data;
    }

    private static _writeEvent(data: Float64Array, i: number, e: MidiEvent): void {
        data[i] = e.type as number;
        data[i + 1] = e.track;
        data[i + 2] = e.tick;
        switch (e.type) {
            case MidiEventType.TimeSignature:
                const ts = e as TimeSignatureEvent;
                data[i + 3] = ts.numerator;
                data[i + 4] = ts.denominatorIndex;
                data[i + 5] = ts.midiClocksPerMetronomeClick;
                data[i + 6] = ts.thirtySecondNodesInQuarter;
                break;
            case MidiEventType.AlphaTabRest:
                data[i + 3] = (e as AlphaTabRestEvent).channel;
                break;
            case MidiEventType.AlphaTabMetronome:
                const metronome = e as AlphaTabMetronomeEvent;
                data[i + 3] = metronome.metronomeNumerator;
                data[i + 4] = metronome.metronomeDurationInTicks;
                data[i + 5] = metronome.metronomeDurationInMilliseconds;
                break;
            case MidiEventType.NoteOn:
            case MidiEventType.NoteOff:
                const note = e as NoteEvent;
                data[i + 3] = note.channel;
                data[i + 4] = note.noteKey;
                data[i + 5] = note.noteVelocity;
                break;
            case MidiEventType.ControlChange:
                const cc = e as ControlChangeEvent;
                data[i + 3] = cc.channel;
                data[i + 4] = cc.controller as number;
                data[i + 5] = cc.value;
                break;
            case MidiEventType.ProgramChange:
                const program = e as ProgramChangeEvent;
                data[i + 3] = program.channel;
                data[i + 4] = program.program;
                break;
            case MidiEventType.TempoChange:
                data[i + 3] = (e as TempoChangeEvent).beatsPerMinute;
                break;
            case MidiEventType.PitchBend:
                const bend = e as PitchBendEvent;
                data[i + 3] = bend.channel;
                data[i + 4] = bend.value;
                break;
            case MidiEventType.PerNotePitchBend:
                const noteBend = e as NoteBendEvent;
                data[i + 3] = noteBend.channel;
                data[i + 4] = noteBend.noteKey;
                data[i + 5] = noteBend.value;
                break;
        }
    }

    public static decode(data: Float64Array): MidiFile {
        const midi = new MidiFile();
        midi.division = data[0];
        midi.tickShift = data[1];
        const trackCount = data[2];
        let i = 3 + trackCount;
        for (let t = 0; t < trackCount; t++) {
            const track = new MidiTrack();
            const eventCount = data[3 + t];
            const events = track.events;
            for (let e = 0; e < eventCount; e++) {
                events.push(MidiFileWire._readEvent(data, i));
                i += MidiFileWire._eventSize;
            }
            midi.tracks.push(track);
        }
        return midi;
    }

    private static _readEvent(data: Float64Array, i: number): MidiEvent {
        const type = data[i] as MidiEventType;
        const track = data[i + 1];
        const tick = data[i + 2];
        switch (type) {
            case MidiEventType.TimeSignature:
                return new TimeSignatureEvent(track, tick, data[i + 3], data[i + 4], data[i + 5], data[i + 6]);
            case MidiEventType.AlphaTabRest:
                return new AlphaTabRestEvent(track, tick, data[i + 3]);
            case MidiEventType.AlphaTabMetronome:
                return new AlphaTabMetronomeEvent(track, tick, data[i + 3], data[i + 4], data[i + 5]);
            case MidiEventType.NoteOn:
                return new NoteOnEvent(track, tick, data[i + 3], data[i + 4], data[i + 5]);
            case MidiEventType.NoteOff:
                return new NoteOffEvent(track, tick, data[i + 3], data[i + 4], data[i + 5]);
            case MidiEventType.ControlChange:
                return new ControlChangeEvent(track, tick, data[i + 3], data[i + 4] as ControllerType, data[i + 5]);
            case MidiEventType.ProgramChange:
                return new ProgramChangeEvent(track, tick, data[i + 3], data[i + 4]);
            case MidiEventType.TempoChange:
                const tempo = new TempoChangeEvent(tick, 0);
                tempo.beatsPerMinute = data[i + 3];
                return tempo;
            case MidiEventType.PitchBend:
                return new PitchBendEvent(track, tick, data[i + 3], data[i + 4]);
            case MidiEventType.PerNotePitchBend:
                return new NoteBendEvent(track, tick, data[i + 3], data[i + 4], data[i + 5]);
            case MidiEventType.EndOfTrack:
                return new EndOfTrackEvent(track, tick);
        }

        throw new AlphaTabError(AlphaTabErrorType.Format, `Unknown Midi Event type: ${type}`);
    }
}
