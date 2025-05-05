import type { IWriteable } from '@src/io/IWriteable';
import { MidiFile } from '@src/midi/MidiFile';
import type { ControllerType } from '@src/midi/ControllerType';
import { AlphaTabError, AlphaTabErrorType } from '@src/AlphaTabError';
import { ByteBuffer } from '@src/io/ByteBuffer';
import { IOHelper } from '@src/io/IOHelper';

/**
 * Lists all midi event types. Based on the type the instance is a specific subclass.
 */
export enum MidiEventType {
    // NOTE: the values try to be backwards compatible with alphaTab 1.2.
    // Some values are aligned with the MIDI1.0 bytes while some others
    // try to resemble the kind (e.g. 0xF1 -> 0xF0 as system exclusive, and +1 for the first event we define)
    // For the custom values we try to not overlap with real MIDI values.

    TimeSignature = 0x58, // 0xFF _0x58_ in Midi 1.0
    NoteOn = 0x80, // Aligned with Midi 1.0
    NoteOff = 0x90, // Aligned with Midi 1.0
    ControlChange = 0xb0, // Aligned with Midi 1.0
    ProgramChange = 0xc0, // Aligned with Midi 1.0
    TempoChange = 0x51, // 0xFF _0x51_ in Midi 1.0
    PitchBend = 0xe0, // Aligned with Midi 1.0
    PerNotePitchBend = 0x60, // Aligned with Midi 2.0
    EndOfTrack = 0x2f, // 0xFF _0x2F_ in Midi 1.0
    AlphaTabRest = 0xf1, // SystemExclusive + 1
    AlphaTabMetronome = 0xf2, // SystemExclusive + 2

    // deprecated events
    /**
     * @deprecated Not used anymore internally. move to the other concrete types.
     */
    SystemExclusive = 0xf0, // Aligned with Midi 1.0
    /**
     * @deprecated Not used anymore internally. move to the other concrete types.
     */
    SystemExclusive2 = 0xf7, // Aligned with Midi 1.0
    /**
     * @deprecated Not used anymore internally. move to the other concrete types.
     */
    Meta = 0xff // Aligned with Midi 1.0
}

/**
 * Represents a midi event.
 */
export abstract class MidiEvent {
    /**
     * Gets or sets the track to which the midi event belongs.
     */
    public track: number;

    /**
     * Gets or sets the absolute tick of this midi event.
     */
    public tick: number;

    /**
     * Gets or sets the midi command (type) of this event.
     */
    public type: MidiEventType;

    /**
     * Initializes a new instance of the {@link MidiEvent} class.
     * @param track The track this event belongs to.
     * @param tick The absolute midi ticks of this event.
     * @param command The type of this event.
     */
    public constructor(track: number, tick: number, command: MidiEventType) {
        this.track = track;
        this.tick = tick;
        this.type = command;
    }

    // for backwards compatibility
    /**
     * @deprecated Change to `type`
     */
    public get command(): MidiEventType {
        return this.type;
    }

    /**
     * The 32-bit encoded raw midi message. Deprecated {@since 1.3.0}. Use the properties of the subclasses instead.
     * @deprecated Use individual properties to access data.
     */
    public get message(): number {
        return 0;
    }

    /**
     * The first data byte. Meaning depends on midi event type. (Deprecated {@since 1.3.0}, use the specific properties of the midi event depending on type)
     * @deprecated Use individual properties to access data.
     */
    public get data1(): number {
        return 0;
    }
    /**
     * The second data byte Meaning depends on midi event type. (Deprecated {@since 1.3.0}, use the specific properties of the midi event depending on type)
     * @deprecated Use individual properties to access data.
     */
    public get data2(): number {
        return 0;
    }

    /**
     * Writes the midi event as binary into the given stream.
     * @param s The stream to write to.
     */
    public abstract writeTo(s: IWriteable): void;
}

/**
 * Represents a time signature change event.
 */
export class TimeSignatureEvent extends MidiEvent {
    /**
     * The time signature numerator.
     */
    public numerator: number;

    /**
     * The denominator index is a negative power of two: 2 represents a quarter-note, 3 represents an eighth-note, etc.
     * Denominator = 2^(index)
     */
    public denominatorIndex: number;

    /**
     * The number of MIDI clocks in a metronome click
     */
    public midiClocksPerMetronomeClick: number;

    /**
     * The number of notated 32nd-notes in what MIDI thinks of as a quarter-note (24 MIDI Clocks).
     */
    public thirtySecondNodesInQuarter: number;

    public constructor(
        track: number,
        tick: number,
        numerator: number,
        denominatorIndex: number,
        midiClocksPerMetronomeClick: number,
        thirtySecondNodesInQuarter: number
    ) {
        super(track, tick, MidiEventType.TimeSignature);
        this.track = track;
        this.tick = tick;
        this.numerator = numerator;
        this.denominatorIndex = denominatorIndex;
        this.midiClocksPerMetronomeClick = midiClocksPerMetronomeClick;
        this.thirtySecondNodesInQuarter = thirtySecondNodesInQuarter;
    }

    public override writeTo(s: IWriteable): void {
        // meta header
        s.writeByte(0xff);
        // time signature
        s.writeByte(0x58);
        // size
        MidiFile.writeVariableInt(s, 4);
        // Data
        s.writeByte(this.numerator & 0xff);
        s.writeByte(this.denominatorIndex & 0xff);
        s.writeByte(this.midiClocksPerMetronomeClick & 0xff);
        s.writeByte(this.thirtySecondNodesInQuarter & 0xff);
    }
}

/**
 * The base class for alphaTab specific midi events (like metronomes and rests).
 */
export abstract class AlphaTabSysExEvent extends MidiEvent {
    public static readonly AlphaTabManufacturerId = 0x7d;
    public static readonly MetronomeEventId = 0x00;
    public static readonly RestEventId = 0x01;

    public override writeTo(s: IWriteable): void {
        // sysex
        s.writeByte(0xf0);

        // data
        const data = ByteBuffer.withCapacity(16);
        data.writeByte(AlphaTabSysExEvent.AlphaTabManufacturerId);
        this.writeEventData(data);
        // syntactic sysex end
        data.writeByte(0xf7);

        MidiFile.writeVariableInt(s, data.length);
        data.copyTo(s);
    }

    protected abstract writeEventData(s: IWriteable): void;
}

/**
 * Represents a metronome event. This event is emitted by the synthesizer only during playback and
 * is typically not part of the midi file itself.
 */
export class AlphaTabMetronomeEvent extends AlphaTabSysExEvent {
    /**
     * The metronome counter as per current time signature.
     */
    public metronomeNumerator: number;

    /**
     * The duration of the metronome tick in MIDI ticks.
     */
    public metronomeDurationInTicks: number;

    /**
     * The duration of the metronome tick in milliseconds.
     */
    public metronomeDurationInMilliseconds: number;

    // for backwards compatibility.

    /**
     * Gets a value indicating whether the current event is a metronome event.
     */
    public readonly isMetronome: boolean = true;

    public constructor(
        track: number,
        tick: number,
        counter: number,
        durationInTicks: number,
        durationInMillis: number
    ) {
        super(track, tick, MidiEventType.AlphaTabMetronome);
        this.metronomeNumerator = counter;
        this.metronomeDurationInMilliseconds = durationInMillis;
        this.metronomeDurationInTicks = durationInTicks;
    }

    protected override writeEventData(s: IWriteable) {
        s.writeByte(AlphaTabSysExEvent.MetronomeEventId);
        s.writeByte(this.metronomeNumerator);
        IOHelper.writeInt32LE(s, this.metronomeDurationInTicks);
        IOHelper.writeInt32LE(s, this.metronomeDurationInMilliseconds);
    }
}

/**
 * Represents a REST beat being 'played'. This event supports alphaTab in placing the cursor.
 */
export class AlphaTabRestEvent extends AlphaTabSysExEvent {
    public channel: number;

    public constructor(track: number, tick: number, channel: number) {
        super(track, tick, MidiEventType.AlphaTabRest);
        this.channel = channel;
    }

    protected override writeEventData(s: IWriteable) {
        s.writeByte(AlphaTabSysExEvent.RestEventId);
        s.writeByte(this.channel);
    }
}

/**
 * The base class for note related events.
 */
export abstract class NoteEvent extends MidiEvent {
    /**
     * The channel on which the note is played.
     */
    public channel: number;

    /**
     * The key of the note being played (aka. the note height).
     */
    public noteKey: number;

    /**
     * The velocity in which the 'key' of the note is pressed (aka. the loudness/intensity of the note).
     */
    public noteVelocity: number;

    public constructor(
        track: number,
        tick: number,
        type: MidiEventType,
        channel: number,
        noteKey: number,
        noteVelocity: number
    ) {
        super(track, tick, type);

        this.channel = channel;
        this.noteKey = noteKey;
        this.noteVelocity = noteVelocity;
    }

    public override get data1(): number {
        return this.noteKey;
    }

    public override get data2(): number {
        return this.noteVelocity;
    }
}

/**
 * Represents a note being played
 */
export class NoteOnEvent extends NoteEvent {
    public constructor(track: number, tick: number, channel: number, noteKey: number, noteVelocity: number) {
        super(track, tick, MidiEventType.NoteOn, channel, noteKey, noteVelocity);
    }

    public override writeTo(s: IWriteable): void {
        // status byte
        s.writeByte((this.channel & 0x0f) | 0x90);
        s.writeByte(this.noteKey & 0xff);
        s.writeByte(this.noteVelocity & 0xff);
    }
}

/**
 * Represents a note stop being played.
 */
export class NoteOffEvent extends NoteEvent {
    public constructor(track: number, tick: number, channel: number, noteKey: number, noteVelocity: number) {
        super(track, tick, MidiEventType.NoteOff, channel, noteKey, noteVelocity);
    }

    public override writeTo(s: IWriteable): void {
        // status byte
        s.writeByte((this.channel & 0x0f) | 0x80);
        s.writeByte(this.noteKey & 0xff);
        s.writeByte(this.noteVelocity & 0xff);
    }
}

/**
 * Represents the change of a value on a midi controller.
 */
export class ControlChangeEvent extends MidiEvent {
    /**
     * The channel for which the controller is changing.
     */
    public channel: number;

    /**
     * The type of the controller which is changing.
     */
    public controller: ControllerType;

    /**
     * The new value of the controller. The meaning is depending on the controller type.
     */
    public value: number;

    public constructor(track: number, tick: number, channel: number, controller: ControllerType, value: number) {
        super(track, tick, MidiEventType.ControlChange);
        this.channel = channel;
        this.controller = controller;
        this.value = value;
    }

    public override writeTo(s: IWriteable): void {
        s.writeByte((this.channel & 0x0f) | 0xb0);
        s.writeByte((this.controller as number) & 0xff);
        s.writeByte(this.value & 0xff);
    }

    public override get data1(): number {
        return this.controller as number;
    }

    public override get data2(): number {
        return this.value;
    }
}

/**
 * Represents the change of the midi program on a channel.
 */
export class ProgramChangeEvent extends MidiEvent {
    /**
     * The midi channel for which the program changes.
     */
    public channel: number;

    /**
     * The numeric value of the program indicating the instrument bank to choose.
     */
    public program: number;

    public constructor(track: number, tick: number, channel: number, program: number) {
        super(track, tick, MidiEventType.ProgramChange);
        this.channel = channel;
        this.program = program;
    }

    public override writeTo(s: IWriteable): void {
        s.writeByte((this.channel & 0x0f) | 0xc0);
        s.writeByte(this.program & 0xff);
    }

    public override get data1(): number {
        return this.program;
    }
}

/**
 * Represents a change of the tempo in the song.
 */
export class TempoChangeEvent extends MidiEvent {
    /**
     * The tempo in microseconds per quarter note (aka USQ). A time format typically for midi.
     */
    public get microSecondsPerQuarterNote(): number {
        return 60000000 / this.beatsPerMinute;
    }
/**
     * The tempo in microseconds per quarter note (aka USQ). A time format typically for midi.
     */
    public set microSecondsPerQuarterNote(value : number) {
        this.beatsPerMinute = 60000000 / value;
    }

    /**
     * The tempo in beats per minute
     */
    public beatsPerMinute: number = 0;

    public constructor(tick: number, microSecondsPerQuarterNote: number) {
        super(0, tick, MidiEventType.TempoChange);
        this.microSecondsPerQuarterNote = microSecondsPerQuarterNote;
    }

    public override writeTo(s: IWriteable): void {
        // meta
        s.writeByte(0xff);
        // set tempo
        s.writeByte(0x51);
        // size
        s.writeByte(0x03);
        // tempo
        s.writeByte((this.microSecondsPerQuarterNote >> 16) & 0xff);
        s.writeByte((this.microSecondsPerQuarterNote >> 8) & 0xff);
        s.writeByte(this.microSecondsPerQuarterNote & 0xff);
    }
}

/**
 * Represents a change of the pitch bend (aka. pitch wheel) on a specific channel.
 */
export class PitchBendEvent extends MidiEvent {
    /**
     * The channel for which the pitch bend changes.
     */
    public channel: number;

    /**
     * The value to which the pitch changes. This value is according to the MIDI specification.
     */
    public value: number;

    public constructor(track: number, tick: number, channel: number, value: number) {
        super(track, tick, MidiEventType.PitchBend);
        this.channel = channel;
        this.value = value;
    }

    public override writeTo(s: IWriteable): void {
        s.writeByte((this.channel & 0x0f) | 0xe0);
        s.writeByte(this.value & 0x7f);
        s.writeByte((this.value >> 7) & 0x7f);
    }

    public override get data1(): number {
        return this.value & 0x7f;
    }

    public override get data2(): number {
        return (this.value >> 7) & 0x7f;
    }
}

/**
 * Represents a single note pitch bend change.
 */
export class NoteBendEvent extends MidiEvent {
    /**
     * The channel on which the note is played for which the pitch changes.
     */
    public channel: number;

    /**
     * The key of the note for which the pitch changes.
     */
    public noteKey: number;

    /**
     * The value to which the pitch changes. This value is according to the MIDI specification.
     */
    public value: number;

    public constructor(track: number, tick: number, channel: number, noteKey: number, value: number) {
        super(track, tick, MidiEventType.PerNotePitchBend);
        this.channel = channel;
        this.noteKey = noteKey;
        this.value = value;
    }

    public override writeTo(s: IWriteable): void {
        throw new AlphaTabError(AlphaTabErrorType.General, 'Note Bend (Midi2.0) events cannot be exported to SMF1.0');
    }
}

/**
 * Represents the end of the track indicating that no more events for this track follow.
 */
export class EndOfTrackEvent extends MidiEvent {
    public constructor(track: number, tick: number) {
        super(track, tick, MidiEventType.EndOfTrack);
    }

    public override writeTo(s: IWriteable): void {
        s.writeByte(0xff);
        s.writeByte(0x2f);
        s.writeByte(0x00);
    }
}
