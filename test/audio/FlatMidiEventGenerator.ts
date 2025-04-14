import type { ControllerType } from '@src/midi/ControllerType';
import type { IMidiFileHandler } from '@src/midi/IMidiFileHandler';

export class FlatMidiEventGenerator implements IMidiFileHandler {
    public midiEvents: FlatMidiEvent[];

    public constructor() {
        this.midiEvents = [];
    }

    public addTimeSignature(tick: number, timeSignatureNumerator: number, timeSignatureDenominator: number): void {
        const e = new FlatTimeSignatureEvent(tick, timeSignatureNumerator, timeSignatureDenominator);
        this.midiEvents.push(e);
    }

    public addRest(track: number, tick: number, channel: number): void {
        const e = new FlatRestEvent(tick, track, channel);
        this.midiEvents.push(e);
    }

    public addNote(track: number, start: number, length: number, key: number, velocity: number, channel: number): void {
        const e = new FlatNoteEvent(start, track, channel, length, key, velocity);
        this.midiEvents.push(e);
    }

    public addControlChange(
        track: number,
        tick: number,
        channel: number,
        controller: ControllerType,
        value: number
    ): void {
        const e = new FlatControlChangeEvent(tick, track, channel, controller, value);
        this.midiEvents.push(e);
    }

    public addProgramChange(track: number, tick: number, channel: number, program: number): void {
        const e = new FlatProgramChangeEvent(tick, track, channel, program);
        this.midiEvents.push(e);
    }

    public addTempo(tick: number, tempo: number): void {
        const e = new FlatTempoEvent(tick, tempo);
        this.midiEvents.push(e);
    }

    public addBend(track: number, tick: number, channel: number, value: number): void {
        const e = new FlatBendEvent(tick, track, channel, value);
        this.midiEvents.push(e);
    }

    public addNoteBend(track: number, tick: number, channel: number, key: number, value: number): void {
        const e = new FlatNoteBendEvent(tick, track, channel, key, value);
        this.midiEvents.push(e);
    }

    public finishTrack(track: number, tick: number): void {
        const e = new FlatTrackEndEvent(tick, track);
        this.midiEvents.push(e);
    }
}

export class FlatMidiEvent {
    public tick: number = 0;

    public constructor(tick: number) {
        this.tick = tick;
    }

    public toString(): string {
        return `Tick[${this.tick}]`;
    }

    protected equals_FlatMidiEventGenerator_MidiEvent(other: FlatMidiEvent): boolean {
        return this.tick === other.tick;
    }

    public equals(obj: unknown): boolean {
        if (!obj) {
            return false;
        }

        if (obj === this) {
            return true;
        }

        if (obj instanceof FlatMidiEvent) {
            return this.tick === obj.tick;
        }
        return false;
    }
}

export class FlatTempoEvent extends FlatMidiEvent {
    public tempo: number = 0;

    public constructor(tick: number, tempo: number) {
        super(tick);
        this.tempo = tempo;
    }

    public override toString(): string {
        return `Tempo: ${super.toString()} Tempo[${this.tempo}]`;
    }

    public override equals(obj: unknown): boolean {
        if (!super.equals(obj)) {
            return false;
        }

        if (obj instanceof FlatTempoEvent) {
            return this.tempo === obj.tempo;
        }

        return false;
    }
}

export class FlatTimeSignatureEvent extends FlatMidiEvent {
    public numerator: number = 0;
    public denominator: number = 0;

    public constructor(tick: number, numerator: number, denominator: number) {
        super(tick);
        this.numerator = numerator;
        this.denominator = denominator;
    }

    public override toString(): string {
        return `TimeSignature: ${super.toString()} Numerator[${this.numerator}] Denominator[${this.denominator}]`;
    }

    public override equals(obj: unknown): boolean {
        if (!super.equals(obj)) {
            return false;
        }

        if (obj instanceof FlatTimeSignatureEvent) {
            return this.numerator === obj.numerator && this.denominator === obj.denominator;
        }

        return false;
    }
}

export class FlatTrackMidiEvent extends FlatMidiEvent {
    public track: number = 0;

    public constructor(tick: number, track: number) {
        super(tick);
        this.track = track;
    }

    public override toString(): string {
        return `${super.toString()} Track[${this.track}]`;
    }

    public override equals(obj: unknown): boolean {
        if (!super.equals(obj)) {
            return false;
        }

        if (obj instanceof FlatTrackMidiEvent) {
            return this.track === obj.track;
        }

        return false;
    }
}

export class FlatTrackEndEvent extends FlatTrackMidiEvent {
    public override toString(): string {
        return `End of Track ${super.toString()}`;
    }
}

export class FlatChannelMidiEvent extends FlatTrackMidiEvent {
    public channel: number = 0;

    public constructor(tick: number, track: number, channel: number) {
        super(tick, track);
        this.channel = channel;
    }

    public override toString(): string {
        return `${super.toString()} Channel[${this.channel}]`;
    }

    public override equals(obj: unknown): boolean {
        if (!super.equals(obj)) {
            return false;
        }

        if (obj instanceof FlatChannelMidiEvent) {
            return this.channel === obj.channel;
        }

        return false;
    }
}

export class FlatControlChangeEvent extends FlatChannelMidiEvent {
    public controller: ControllerType;
    public value: number = 0;

    public constructor(tick: number, track: number, channel: number, controller: ControllerType, value: number) {
        super(tick, track, channel);
        this.controller = controller;
        this.value = value;
    }

    public override toString(): string {
        return `ControlChange: ${super.toString()} Controller[${this.controller}] Value[${this.value}]`;
    }

    public override equals(obj: unknown): boolean {
        if (!super.equals(obj)) {
            return false;
        }

        if (obj instanceof FlatControlChangeEvent) {
            return this.controller === obj.controller && this.channel === obj.channel && this.value === obj.value;
        }

        return false;
    }
}

export class FlatRestEvent extends FlatChannelMidiEvent {
    public override toString(): string {
        return `Rest: ${super.toString()}`;
    }

    public override equals(obj: unknown): boolean {
        if (!super.equals(obj)) {
            return false;
        }

        if (obj instanceof FlatTempoEvent) {
            return true;
        }
        return false;
    }
}

export class FlatProgramChangeEvent extends FlatChannelMidiEvent {
    public program: number = 0;

    public constructor(tick: number, track: number, channel: number, program: number) {
        super(tick, track, channel);
        this.program = program;
    }

    public override toString(): string {
        return `ProgramChange: ${super.toString()} Program[${this.program}]`;
    }

    public override equals(obj: unknown): boolean {
        if (!super.equals(obj)) {
            return false;
        }

        if (obj instanceof FlatProgramChangeEvent) {
            return this.program === obj.program;
        }

        return false;
    }
}

export class FlatNoteEvent extends FlatChannelMidiEvent {
    public length: number = 0;
    public key: number = 0;
    public velocity: number;

    public constructor(tick: number, track: number, channel: number, length: number, key: number, velocity: number) {
        super(tick, track, channel);
        this.length = length;
        this.key = key;
        this.velocity = velocity;
    }

    public override toString(): string {
        return `Note: ${super.toString()} Length[${this.length}] Key[${this.key}] Velocity[${this.velocity}]`;
    }

    public override equals(obj: unknown): boolean {
        if (!super.equals(obj)) {
            return false;
        }

        if (obj instanceof FlatNoteEvent) {
            return this.length === obj.length && this.key === obj.key && this.velocity === obj.velocity;
        }

        return false;
    }
}

export class FlatBendEvent extends FlatChannelMidiEvent {
    public value: number = 0;

    public constructor(tick: number, track: number, channel: number, value: number) {
        super(tick, track, channel);
        this.value = value;
    }

    public override toString(): string {
        return `Bend: ${super.toString()} Value[${this.value}]`;
    }

    public override equals(obj: unknown): boolean {
        if (!super.equals(obj)) {
            return false;
        }

        if (obj instanceof FlatBendEvent) {
            return this.value === obj.value;
        }

        return false;
    }
}
export class FlatNoteBendEvent extends FlatChannelMidiEvent {
    public key: number;
    public value: number;

    public constructor(tick: number, track: number, channel: number, key: number, value: number) {
        super(tick, track, channel);
        this.key = key;
        this.value = value;
    }

    public override toString(): string {
        return `NoteBend: ${super.toString()} Key[${this.key}] Value[${this.value}]`;
    }

    public override equals(obj: unknown): boolean {
        if (!super.equals(obj)) {
            return false;
        }

        if (obj instanceof FlatNoteBendEvent) {
            return this.value === obj.value && this.key === obj.key;
        }

        return false;
    }
}
