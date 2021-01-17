import { MidiEvent, MidiEventType } from '@src/midi/MidiEvent';

export enum MetaEventType {
    SequenceNumber = 0x00,
    TextEvent = 0x01,
    CopyrightNotice = 0x02,
    SequenceOrTrackName = 0x03,
    InstrumentName = 0x04,
    LyricText = 0x05,
    MarkerText = 0x06,
    CuePoint = 0x07,
    PatchName = 0x08,
    PortName = 0x09,
    MidiChannel = 0x20,
    MidiPort = 0x21,
    EndOfTrack = 0x2F,
    Tempo = 0x51,
    SmpteOffset = 0x54,
    TimeSignature = 0x58,
    KeySignature = 0x59,
    SequencerSpecific = 0x7F
}

export class MetaEvent extends MidiEvent {
    public get channel(): number {
        return -1;
    }

    public get command(): MidiEventType {
        return (this.message & 0x00000ff) as MidiEventType;
    }

    public get metaStatus(): MetaEventType {
        return this.data1 as MetaEventType;
    }

    protected constructor(track: number, delta: number, status: number, data1: number, data2: number) {
        super(track, delta, status, data1, data2);
    }
}
