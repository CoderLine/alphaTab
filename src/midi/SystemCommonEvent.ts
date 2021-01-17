import { MidiEvent, MidiEventType } from '@src/midi/MidiEvent';

export enum SystemCommonType {
    SystemExclusive = 0xF0,
    MtcQuarterFrame = 0xF1,
    SongPosition = 0xF2,
    SongSelect = 0xF3,
    TuneRequest = 0xF6,
    SystemExclusive2 = 0xF7
}

export class SystemCommonEvent extends MidiEvent {
    public get channel(): number {
        return -1;
    }

    public get command(): MidiEventType {
        return (this.message & 0x00000ff) as MidiEventType;
    }

    protected constructor(track:number, delta: number, status: number, data1: number, data2: number) {
        super(track, delta, status, data1, data2);
    }
}
