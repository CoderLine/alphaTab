import { IWriteable } from '@src/io/IWriteable';
import { MidiFile } from './MidiFile';
import { ControllerType } from './ControllerType';
import { AlphaTabError, AlphaTabErrorType } from '@src/AlphaTabError';
import { ByteBuffer } from '@src/io/ByteBuffer';
import { IOHelper } from '@src/io/IOHelper';

/**
 * Lists all midi events.
 */
export enum MidiEventType {
    TimeSignature = 0,
    NoteOn,
    NoteOff,
    ControlChange,
    ProgramChange,
    TempoChange,
    PitchBend,
    NoteBend,
    EndOfTrack,
    AlphaTabRest,
    AlphaTabMetronome
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

    /**
     * Writes the midi event as binary into the given stream.
     * @param s The stream to write to.
     */
    public abstract writeTo(s: IWriteable): void;
}


export class TimeSignatureEvent extends MidiEvent {
    public numerator: number;
    public denominatorIndex: number;
    public midiClocksPerMetronomeClick: number;
    public thirdySecondNodesInQuarter: number;

    public constructor(track: number, tick: number,
        numerator: number,
        denominatorIndex: number,
        midiClocksPerMetronomeClick: number,
        thirdySecondNodesInQuarter: number) {
        super(track, tick, MidiEventType.TimeSignature);
        this.track = track;
        this.tick = tick;
        this.numerator = numerator;
        this.denominatorIndex = denominatorIndex;
        this.midiClocksPerMetronomeClick = midiClocksPerMetronomeClick;
        this.thirdySecondNodesInQuarter = thirdySecondNodesInQuarter;
    }

    public override writeTo(s: IWriteable): void {
        // meta header
        s.writeByte(0xFF);
        // time signature
        s.writeByte(0x58);
        s.writeByte(this.numerator & 0xFF);
        s.writeByte(this.denominatorIndex & 0xFF);
        s.writeByte(this.midiClocksPerMetronomeClick & 0xFF);
        s.writeByte(this.thirdySecondNodesInQuarter & 0xFF);
    }
}


export abstract class AlphaTabSysExEvent extends MidiEvent {
    public static readonly AlphaTabManufacturerId = 0x7D;
    public static readonly MetronomeEventId = 0x00;
    public static readonly RestEventId = 0x01;

    public constructor(track: number, tick: number, type: MidiEventType) {
        super(track, tick, type);
    }

    public override writeTo(s: IWriteable): void {
        // sysex
        s.writeByte(0xF0);

        // data
        const data = ByteBuffer.withCapacity(16);
        data.writeByte(AlphaTabSysExEvent.AlphaTabManufacturerId);
        this.writeEventData(data);
        // syntactic sysex end
        data.writeByte(0xF7);

        MidiFile.writeVariableInt(s, data.length);
        data.copyTo(s);
    }

    protected abstract writeEventData(s: IWriteable): void;
}

export class AlphaTabMetronomeEvent extends AlphaTabSysExEvent {
    public counter: number;
    public durationInTicks: number;
    public durationInMillis: number;

    public constructor(track: number, tick: number,
        counter: number,
        durationInTicks: number,
        durationInMillis: number
    ) {
        super(track, tick, MidiEventType.AlphaTabMetronome);
        this.counter = counter;
        this.durationInMillis = durationInMillis;
        this.durationInTicks = durationInTicks;
    }

    protected override writeEventData(s: IWriteable) {
        s.writeByte(AlphaTabSysExEvent.MetronomeEventId);
        s.writeByte(this.counter);
        IOHelper.writeInt32LE(s, this.durationInTicks);
        IOHelper.writeInt32LE(s, this.durationInMillis);
    }
}

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


export class NoteEvent extends MidiEvent {
    public channel: number;
    public noteKey: number;
    public noteVelocity: number;

    public constructor(track: number,
        tick: number,
        type: MidiEventType,
        channel: number,
        noteKey: number,
        noteVelocity: number) {
        super(track, tick, type);

        this.channel = channel;
        this.noteKey = noteKey;
        this.noteVelocity = noteVelocity;
    }


    public override writeTo(s: IWriteable): void {
        // status byte
        s.writeByte((this.channel & 0x0F) | 0x90)
        s.writeByte(this.noteKey & 0xFF);
        s.writeByte(this.noteVelocity & 0xFF);
    }
}

export class NoteOnEvent extends NoteEvent {
    public constructor(track: number,
        tick: number,
        channel: number,
        noteKey: number,
        noteVelocity: number) {
        super(track, tick, MidiEventType.NoteOn, channel, noteKey, noteVelocity);
    }
}


export class NoteOffEvent extends NoteEvent {
    public constructor(track: number, tick: number,
        channel: number,
        noteKey: number,
        noteVelocity: number) {
        super(track, tick, MidiEventType.NoteOff, channel, noteKey, noteVelocity);
    }
}

export class ControlChangeEvent extends MidiEvent {
    public channel: number;
    public controller: ControllerType;
    public value: number;

    public constructor(track: number,
        tick: number,
        channel: number,
        controller: ControllerType,
        value: number) {
        super(track, tick, MidiEventType.ControlChange);
        this.channel = channel;
        this.controller = controller;
        this.value = value;
    }

    public override writeTo(s: IWriteable): void {
        s.writeByte((this.channel & 0x0F) | 0xB0)
        s.writeByte((this.controller as number) & 0xFF);
        s.writeByte(this.value & 0xFF);
    }
}

export class ProgramChangeEvent extends MidiEvent {
    public channel: number;
    public program: number;

    public constructor(track: number,
        tick: number,
        channel: number,
        program: number) {
        super(track, tick, MidiEventType.ProgramChange);
        this.channel = channel;
        this.program = program;
    }

    public override writeTo(s: IWriteable): void {
        s.writeByte((this.channel & 0x0F) | 0xC0)
        s.writeByte(this.program & 0xFF);
    }
}

export class TempoChangeEvent extends MidiEvent {
    public microSecondsPerQuarterNote: number;

    public constructor(tick: number, microSecondsPerQuarterNote: number) {
        super(0, tick, MidiEventType.TempoChange);
        this.microSecondsPerQuarterNote = microSecondsPerQuarterNote;
    }

    public override writeTo(s: IWriteable): void {
        // meta
        s.writeByte(0xFF);
        // set tempo
        s.writeByte(0x51);
        // size
        s.writeByte(0x03);
        // tempo 
        s.writeByte((this.microSecondsPerQuarterNote >> 16) & 0xFF);
        s.writeByte((this.microSecondsPerQuarterNote >> 8) & 0xFF);
        s.writeByte(this.microSecondsPerQuarterNote & 0xFF);
    }
}

export class PitchBendEvent extends MidiEvent {
    public channel: number;
    public value: number;

    public constructor(track: number,
        tick: number,
        channel: number,
        value: number) {
        super(track, tick, MidiEventType.PitchBend);
        this.channel = channel;
        this.value = value;
    }

    public override writeTo(s: IWriteable): void {
        s.writeByte((this.channel & 0x0F) | 0xE0)
        s.writeByte(this.value & 0x7F);
        s.writeByte((this.value >> 7) & 0x7F);
    }
}

export class NoteBendEvent extends MidiEvent {
    public channel: number;
    public noteKey: number;
    public value: number;

    public constructor(track: number,
        tick: number,
        channel: number,
        noteKey: number,
        value: number) {
        super(track, tick, MidiEventType.NoteBend);
        this.channel = channel;
        this.noteKey = noteKey;
        this.value = value;
    }

    public override writeTo(s: IWriteable): void {
        throw new AlphaTabError(AlphaTabErrorType.General, 'Note Bend (Midi2.0) events cannot be exported to SMF1.0');
    }
}

export class EndOfTrackEvent extends MidiEvent {
    public constructor(track: number, tick: number) {
        super(track, tick, MidiEventType.EndOfTrack);
    }

    public override writeTo(s: IWriteable): void {
        s.writeByte(0xFF);
        s.writeByte(0x2F);
        s.writeByte(0x00);
    }
}
