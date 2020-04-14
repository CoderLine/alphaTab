import { MidiEvent, MidiEventType } from '@src/audio/midi/event/MidiEvent';

export enum SystemCommonType {
    SystemExclusive = 240,
    MtcQuarterFrame = 241,
    SongPosition = 242,
    SongSelect = 243,
    TuneRequest = 246,
    SystemExclusive2 = 247
}

export class SystemCommonEvent extends MidiEvent {
    public get channel(): number {
        return -1;
    }

    public get command(): MidiEventType {
        return (this.message & 0x00000ff) as MidiEventType;
    }

    protected constructor(delta: number, status: number, data1: number, data2: number) {
        super(delta, status, data1, data2);
    }
}
