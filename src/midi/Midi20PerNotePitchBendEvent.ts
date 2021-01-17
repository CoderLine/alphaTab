import { IWriteable } from '@src/io/IWriteable';
import { MidiEvent } from '@src/midi/MidiEvent';

/*
 * Represents a MIDI 2.0 Channel Voice Message.
 */
export class Midi20PerNotePitchBendEvent extends MidiEvent {

    public noteKey: number;
    public pitch: number;

    public constructor(track:number, tick: number, status: number, noteKey: number, pitch: number) {
        super(track, tick, status, 0, 0);
        this.noteKey = noteKey;
        this.pitch = pitch;
    }

    /**
     * Writes the midi event as binary into the given stream.
     * @param s The stream to write to.
     */
    public writeTo(s: IWriteable): void {
        let b: Uint8Array = new Uint8Array([
            0x40,
            this.message & 0xff,
            this.noteKey & 0xff,

            0x00 /* reserved */,
            /* 32bit pitch integer */
            (this.pitch >> 24) & 0xff,
            (this.pitch >> 16) & 0xff,
            (this.pitch >> 8) & 0xff,
            this.pitch & 0xff
        ]);
        s.write(b, 0, b.length);
    }
}
