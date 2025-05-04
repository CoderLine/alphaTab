import type { MidiEvent } from '@src/midi/MidiEvent';
import { MidiUtils } from '@src/midi/MidiUtils';
import { ByteBuffer } from '@src/io/ByteBuffer';
import type { IWriteable } from '@src/io/IWriteable';
import { IOHelper } from '@src/io/IOHelper';

/**
 * Lists the different midi file formats which are supported for export.
 */
export enum MidiFileFormat {
    /**
     * A single track multi channel file (SMF Type 0)
     */
    SingleTrackMultiChannel = 0,
    /**
     * A multi track file (SMF Type 1)
     */
    MultiTrack = 1
}

export class MidiTrack {
    /**
     * Gets a list of midi events sorted by time.
     */
    public readonly events: MidiEvent[] = [];

    /**
     * Adds the given midi event a the correct time position into the file.
     */
    public addEvent(e: MidiEvent): void {
        if (this.events.length === 0 || e.tick >= this.events[this.events.length - 1].tick) {
            this.events.push(e);
        } else {
            let insertPos: number = this.events.length;
            while (insertPos > 0) {
                const prevItem: MidiEvent = this.events[insertPos - 1];
                if (prevItem.tick > e.tick) {
                    insertPos--;
                } else {
                    break;
                }
            }
            this.events.splice(insertPos, 0, e);
        }
    }

    /**
     * Writes the midi track as binary into the given stream.
     * @returns The stream to write to.
     */
    public writeTo(s: IWriteable): void {
        // build track data first
        const trackData: ByteBuffer = ByteBuffer.empty();
        let previousTick: number = 0;
        for (const midiEvent of this.events) {
            const delta: number = midiEvent.tick - previousTick;
            MidiFile.writeVariableInt(trackData, delta);
            midiEvent.writeTo(trackData);
            previousTick = midiEvent.tick;
        }
        // end of track
        // magic number "MTrk" (0x4D54726B)
        const b = new Uint8Array([0x4d, 0x54, 0x72, 0x6b]);
        s.write(b, 0, b.length);
        // size as integer
        const data: Uint8Array = trackData.toArray();
        IOHelper.writeInt32BE(s, data.length);
        s.write(data, 0, data.length);
    }
}

/**
 * Represents a midi file with a single track that can be played via {@link AlphaSynth}
 */
export class MidiFile {
    /**
     * Gets or sets the midi file format to use.
     */
    public format: MidiFileFormat = MidiFileFormat.SingleTrackMultiChannel;

    /**
     * Gets or sets the division per quarter notes.
     */
    public division: number = MidiUtils.QuarterTime;

    /**
     * Gets a list of midi events sorted by time.
     */
    public get events(): MidiEvent[] {
        if (this.tracks.length === 1) {
            return this.tracks[0].events;
        }
        const events: MidiEvent[] = [];
        for (const t of this.tracks) {
            this.events.push(...t.events);
        }

        events.sort((a, b) => a.tick - b.tick);
        return events;
    }

    /**
     * Gets a list of midi tracks.
     */
    public readonly tracks: MidiTrack[] = [];

    private ensureTracks(trackCount: number) {
        while (this.tracks.length < trackCount) {
            this.tracks.push(new MidiTrack());
        }
    }

    /**
     * Adds the given midi event a the correct time position into the file.
     */
    public addEvent(e: MidiEvent): void {
        if (this.format === MidiFileFormat.SingleTrackMultiChannel) {
            this.ensureTracks(1);
            this.tracks[0].addEvent(e);
        } else {
            this.ensureTracks(e.track + 1);
            this.tracks[e.track].addEvent(e);
        }
    }

    /**
     * Writes the midi file into a binary format.
     * @returns The binary midi file.
     */
    public toBinary(): Uint8Array {
        const data: ByteBuffer = ByteBuffer.empty();
        this.writeTo(data);
        return data.toArray();
    }

    /**
     * Writes the midi file as binary into the given stream.
     * @returns The stream to write to.
     */
    public writeTo(s: IWriteable): void {
        // magic number "MThd" (0x4D546864)
        const b: Uint8Array = new Uint8Array([0x4d, 0x54, 0x68, 0x64]);
        s.write(b, 0, b.length);
        // Header Length 6 (0x00000006)
        IOHelper.writeInt32BE(s, 6);
        // format (single multi channel track)
        IOHelper.writeInt16BE(s, this.format as number);
        // number of tracks (1)
        IOHelper.writeInt16BE(s, this.tracks.length);
        // division
        IOHelper.writeInt16BE(s, this.division);

        for (const track of this.tracks) {
            track.writeTo(s);
        }
    }

    public static writeVariableInt(s: IWriteable, value: number): void {
        const array: Uint8Array = new Uint8Array(4);
        let n: number = 0;
        do {
            array[n++] = value & 0x7f;
            value >>= 7;
        } while (value > 0);
        while (n > 0) {
            n--;
            if (n > 0) {
                s.writeByte(array[n] | 0x80);
            } else {
                s.writeByte(array[n]);
            }
        }
    }
}
