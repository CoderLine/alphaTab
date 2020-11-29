import { ControllerType } from '@src/midi/ControllerType';
import { IMidiFileHandler } from '@src/midi/IMidiFileHandler';
import { DynamicValue } from '@src/model/DynamicValue';

export class FlatMidiEventGenerator implements IMidiFileHandler {
    public midiEvents: MidiEvent[];

    public constructor() {
        this.midiEvents = [];
    }

    public addTimeSignature(tick: number, timeSignatureNumerator: number, timeSignatureDenominator: number): void {
        let e = new TimeSignatureEvent(tick, timeSignatureNumerator, timeSignatureDenominator);
        this.midiEvents.push(e);
    }

    public addRest(track: number, tick: number, channel: number): void {
        let e = new RestEvent(tick, track, channel);
        this.midiEvents.push(e);
    }

    public addNote(
        track: number,
        start: number,
        length: number,
        key: number,
        dynamicValue: DynamicValue,
        channel: number
    ): void {
        let e = new NoteEvent(start, track, channel, length, key, dynamicValue);
        this.midiEvents.push(e);
    }

    public addControlChange(track: number, tick: number, channel: number, controller: number, value: number): void {
        let e = new ControlChangeEvent(tick, track, channel, controller, value);
        this.midiEvents.push(e);
    }

    public addProgramChange(track: number, tick: number, channel: number, program: number): void {
        let e = new ProgramChangeEvent(tick, track, channel, program);
        this.midiEvents.push(e);
    }

    public addTempo(tick: number, tempo: number): void {
        let e = new TempoEvent(tick, tempo);
        this.midiEvents.push(e);
    }

    public addBend(track: number, tick: number, channel: number, value: number): void {
        let e = new BendEvent(tick, track, channel, value);
        this.midiEvents.push(e);
    }

    public addNoteBend(track: number, tick: number, channel: number, key: number, value: number): void {
        let e = new NoteBendEvent(tick, track, channel, key, value);
        this.midiEvents.push(e);
    }

    public finishTrack(track: number, tick: number): void {
        let e = new TrackEndEvent(tick, track);
        this.midiEvents.push(e);
    }
}

export class MidiEvent {
    public tick: number = 0;

    public constructor(tick: number) {
        this.tick = tick;
    }

    public toString(): string {
        return `Tick[${this.tick}]`;
    }

    protected equals_FlatMidiEventGenerator_MidiEvent(other: MidiEvent): boolean {
        return this.tick === other.tick;
    }

    public equals(obj: unknown): boolean {
        if (!obj) {
            return false;
        }

        if (obj === this) {
            return true;
        }

        if (obj instanceof MidiEvent) {
            return this.tick === obj.tick;
        }
        return false;
    }
}

export class TempoEvent extends MidiEvent {
    public tempo: number = 0;

    public constructor(tick: number, tempo: number) {
        super(tick);
        this.tempo = tempo;
    }

    public toString(): string {
        return `Tempo: ${super.toString()} Tempo[${this.tempo}]`;
    }

    public equals(obj: unknown): boolean {
        if (!super.equals(obj)) {
            return false;
        }

        if (obj instanceof TempoEvent) {
            return this.tempo === obj.tempo;
        }

        return false;
    }
}

export class TimeSignatureEvent extends MidiEvent {
    public numerator: number = 0;
    public denominator: number = 0;

    public constructor(tick: number, numerator: number, denominator: number) {
        super(tick);
        this.numerator = numerator;
        this.denominator = denominator;
    }

    public toString(): string {
        return `TimeSignature: ${super.toString()} Numerator[${this.numerator}] Denominator[${this.denominator}]`;
    }

    public equals(obj: unknown): boolean {
        if (!super.equals(obj)) {
            return false;
        }

        if (obj instanceof TimeSignatureEvent) {
            return this.numerator === obj.numerator && this.denominator === obj.denominator;
        }

        return false;
    }
}

export class TrackMidiEvent extends MidiEvent {
    public track: number = 0;

    public constructor(tick: number, track: number) {
        super(tick);
        this.track = track;
    }

    public toString(): string {
        return `${super.toString()} Track[${this.track}]`;
    }

    public equals(obj: unknown): boolean {
        if (!super.equals(obj)) {
            return false;
        }

        if (obj instanceof TrackMidiEvent) {
            return this.track === obj.track;
        }

        return false;
    }
}

export class TrackEndEvent extends TrackMidiEvent {
    public constructor(tick: number, track: number) {
        super(tick, track);
    }

    public toString(): string {
        return 'End of Track ' + super.toString();
    }
}

export class ChannelMidiEvent extends TrackMidiEvent {
    public channel: number = 0;

    public constructor(tick: number, track: number, channel: number) {
        super(tick, track);
        this.channel = channel;
    }

    public toString(): string {
        return `${super.toString()} Channel[${this.channel}]`;
    }

    public equals(obj: unknown): boolean {
        if (!super.equals(obj)) {
            return false;
        }

        if (obj instanceof ChannelMidiEvent) {
            return this.channel === obj.channel;
        }

        return false;
    }
}

export class ControlChangeEvent extends ChannelMidiEvent {
    public controller: ControllerType;
    public value: number = 0;

    public constructor(tick: number, track: number, channel: number, controller: ControllerType, value: number) {
        super(tick, track, channel);
        this.controller = controller;
        this.value = value;
    }

    public toString(): string {
        return `ControlChange: ${super.toString()} Controller[${this.controller}] Value[${this.value}]`;
    }

    public equals(obj: unknown): boolean {
        if (!super.equals(obj)) {
            return false;
        }

        if (obj instanceof ControlChangeEvent) {
            return this.controller === obj.controller && this.channel === obj.channel && this.value === obj.value;
        }

        return false;
    }
}

export class RestEvent extends ChannelMidiEvent {
    public constructor(tick: number, track: number, channel: number) {
        super(tick, track, channel);
    }

    public toString(): string {
        return `Rest: ${super.toString()}`;
    }

    public equals(obj: unknown): boolean {
        if (!super.equals(obj)) {
            return false;
        }

        if (obj instanceof TempoEvent) {
            return true;
        }
        return false;
    }
}

export class ProgramChangeEvent extends ChannelMidiEvent {
    public program: number = 0;

    public constructor(tick: number, track: number, channel: number, program: number) {
        super(tick, track, channel);
        this.program = program;
    }

    public toString(): string {
        return `ProgramChange: ${super.toString()} Program[${this.program}]`;
    }

    public equals(obj: unknown): boolean {
        if (!super.equals(obj)) {
            return false;
        }

        if (obj instanceof ProgramChangeEvent) {
            return this.program === obj.program;
        }

        return false;
    }
}

export class NoteEvent extends ChannelMidiEvent {
    public length: number = 0;
    public key: number = 0;
    public dynamicValue: DynamicValue;

    public constructor(
        tick: number,
        track: number,
        channel: number,
        length: number,
        key: number,
        dynamicValue: DynamicValue
    ) {
        super(tick, track, channel);
        this.length = length;
        this.key = key;
        this.dynamicValue = dynamicValue;
    }

    public toString(): string {
        return `Note: ${super.toString()} Length[${this.length}] Key[${this.key}] Dynamic[${this.dynamicValue}]`;
    }

    public equals(obj: unknown): boolean {
        if (!super.equals(obj)) {
            return false;
        }

        if (obj instanceof NoteEvent) {
            return this.length === obj.length && this.key === obj.key && this.dynamicValue === obj.dynamicValue;
        }

        return false;
    }
}

export class BendEvent extends ChannelMidiEvent {
    public value: number = 0;

    public constructor(tick: number, track: number, channel: number, value: number) {
        super(tick, track, channel);
        this.value = value;
    }

    public toString(): string {
        return `Bend: ${super.toString()} Value[${this.value}]`;
    }

    public equals(obj: unknown): boolean {
        if (!super.equals(obj)) {
            return false;
        }

        if (obj instanceof BendEvent) {
            return this.value === obj.value;
        }

        return false;
    }
}
export class NoteBendEvent extends ChannelMidiEvent {
    public key: number;
    public value: number;

    public constructor(tick: number, track: number, channel: number, key: number, value: number) {
        super(tick, track, channel);
        this.key = key;
        this.value = value;
    }

    public toString(): string {
        return `NoteBend: ${super.toString()} Key[${this.key}] Value[${this.value}]`;
    }

    public equals(obj: unknown): boolean {
        if (!super.equals(obj)) {
            return false;
        }

        if (obj instanceof NoteBendEvent) {
            return this.value === obj.value && this.key === obj.key;
        }

        return false;
    }
}
