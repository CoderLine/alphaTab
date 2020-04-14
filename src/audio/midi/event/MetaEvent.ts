import { MidiEvent, MidiEventType } from '@src/audio/midi/event/MidiEvent';

export enum MetaEventType {
    SequenceNumber = 0,
    TextEvent = 1,
    CopyrightNotice = 2,
    SequenceOrTrackName = 3,
    InstrumentName = 4,
    LyricText = 5,
    MarkerText = 6,
    CuePoint = 7,
    PatchName = 8,
    PortName = 9,
    MidiChannel = 32,
    MidiPort = 33,
    EndOfTrack = 47,
    Tempo = 81,
    SmpteOffset = 84,
    TimeSignature = 88,
    KeySignature = 89,
    SequencerSpecific = 127
}

export class MetaEvent extends MidiEvent {
    public get channel(): number {
        return -1;
    }

    public get command(): MidiEventType {
        return (this.message & 0x00000ff) as MidiEventType;
    }

    public get metaStatus(): number {
        return this.data1;
    }

    protected constructor(delta: number, status: number, data1: number, data2: number) {
        super(delta, status, data1, data2);
    }
}
