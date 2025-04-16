import type { IWriteable } from '@src/io/IWriteable';
import { MidiEvent, MidiEventType } from '@src/midi/MidiEvent';
import { AlphaTabError, AlphaTabErrorType } from '@src/AlphaTabError';

/**
 * @deprecated Move to the new concrete Midi Event Types.
 */
export class DeprecatedMidiEvent extends MidiEvent {
    public constructor() {
        super(0, 0, MidiEventType.EndOfTrack);
    }

    public override writeTo(s: IWriteable): void {
        throw new AlphaTabError(AlphaTabErrorType.General, 'Deprecated event, serialization not supported');
    }
}

/**
 * @deprecated Move to the new concrete Midi Event Types.
 */
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
    EndOfTrack = 0x2f,
    Tempo = 0x51,
    SmpteOffset = 0x54,
    TimeSignature = 0x58,
    KeySignature = 0x59,
    SequencerSpecific = 0x7f
}

/**
 * @deprecated Move to the new concrete Midi Event Types.
 */
export class MetaEvent extends DeprecatedMidiEvent {
    public get metaStatus(): MetaEventType {
        return MetaEventType.EndOfTrack;
    }
}

/**
 * @deprecated Move to the new concrete Midi Event Types.
 */
export class MetaDataEvent extends MetaEvent {
    public data: Uint8Array = new Uint8Array();
}

/**
 * @deprecated Move to the new concrete Midi Event Types.
 */
export class MetaNumberEvent extends MetaEvent {
    public value: number = 0;
}

/**
 * @deprecated Move to the new concrete Midi Event Types.
 */
export class Midi20PerNotePitchBendEvent extends DeprecatedMidiEvent {
    public noteKey: number = 0;
    public pitch: number = 0;
}

/**
 * @deprecated Move to the new concrete Midi Event Types.
 */
export enum SystemCommonType {
    SystemExclusive = 0xf0,
    MtcQuarterFrame = 0xf1,
    SongPosition = 0xf2,
    SongSelect = 0xf3,
    TuneRequest = 0xf6,
    SystemExclusive2 = 0xf7
}

/**
 * @deprecated Move to the new concrete Midi Event Types.
 */
export class SystemCommonEvent extends DeprecatedMidiEvent {}

/**
 * @deprecated Move to the new concrete Midi Event Types.
 */
export enum AlphaTabSystemExclusiveEvents {
    MetronomeTick = 0,
    Rest = 1
}

/**
 * @deprecated Move to the new concrete Midi Event Types.
 */
export class SystemExclusiveEvent extends SystemCommonEvent {
    public static readonly AlphaTabManufacturerId = 0x7d;

    public data: Uint8Array = new Uint8Array();

    public get isMetronome(): boolean {
        return false;
    }

    public get metronomeNumerator(): number {
        return -1;
    }

    public get metronomeDurationInTicks(): number {
        return -1;
    }

    public get metronomeDurationInMilliseconds(): number {
        return -1;
    }

    public get isRest(): boolean {
        return false;
    }

    public get manufacturerId(): number {
        return 0;
    }
}
