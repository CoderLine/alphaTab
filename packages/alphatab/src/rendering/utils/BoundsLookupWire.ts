/** @target web */
import type { Score } from '@coderline/alphatab/model/Score';
import { BarBounds } from '@coderline/alphatab/rendering/utils/BarBounds';
import { BeatBounds } from '@coderline/alphatab/rendering/utils/BeatBounds';
import { Bounds } from '@coderline/alphatab/rendering/utils/Bounds';
import { BoundsLookup } from '@coderline/alphatab/rendering/utils/BoundsLookup';
import { MasterBarBounds } from '@coderline/alphatab/rendering/utils/MasterBarBounds';
import { NoteBounds } from '@coderline/alphatab/rendering/utils/NoteBounds';
import { StaffSystemBounds } from '@coderline/alphatab/rendering/utils/StaffSystemBounds';

/**
 * Flat numeric encoding of a {@link BoundsLookup} for the hand-off from the rendering worker,
 * carrying the same content as {@link BoundsLookup.toJson}.
 *
 * The stream is one block per staff system, each written depth-first; a bounds is `x, y, w, h`
 * and model objects are referenced by their indexes within the score:
 * ```
 * system    := blockLength, visual, real, masterBarCount, masterBar*
 * masterBar := index, isFirstOfLine, lineAligned, visual, real, barCount, bar*
 * bar       := trackIndex, staffIndex, barIndex, visual, real, beatCount, beat*
 * beat      := trackIndex, staffIndex, barIndex, voiceIndex, beatIndex, onNotesX, visual, real,
 *              noteCount (-1 without note bounds), note*
 * note      := noteIndex, noteHead
 * ```
 * `blockLength` counts all numbers of the block including itself.
 * @target web
 * @internal
 */
export class BoundsLookupWire {
    public static readonly systemSize = 10;
    public static readonly masterBarSize = 15;
    public static readonly barSize = 12;
    public static readonly beatSize = 15;
    public static readonly noteSize = 5;

    public static encode(lookup: BoundsLookup): Float64Array {
        const data = new Float64Array(BoundsLookupWire._encodedLength(lookup));
        let i = 0;
        for (const system of lookup.staffSystems) {
            const blockStart = i;
            i++;
            i = BoundsLookupWire._writeBounds(data, i, system.visualBounds);
            i = BoundsLookupWire._writeBounds(data, i, system.realBounds);
            data[i++] = system.bars.length;
            for (const masterBar of system.bars) {
                data[i++] = masterBar.index;
                data[i++] = masterBar.isFirstOfLine ? 1 : 0;
                i = BoundsLookupWire._writeBounds(data, i, masterBar.lineAlignedBounds);
                i = BoundsLookupWire._writeBounds(data, i, masterBar.visualBounds);
                i = BoundsLookupWire._writeBounds(data, i, masterBar.realBounds);
                data[i++] = masterBar.bars.length;
                for (const bar of masterBar.bars) {
                    data[i++] = bar.bar.staff.track.index;
                    data[i++] = bar.bar.staff.index;
                    data[i++] = bar.bar.index;
                    i = BoundsLookupWire._writeBounds(data, i, bar.visualBounds);
                    i = BoundsLookupWire._writeBounds(data, i, bar.realBounds);
                    data[i++] = bar.beats.length;
                    for (const beat of bar.beats) {
                        const model = beat.beat;
                        const voice = model.voice;
                        data[i++] = voice.bar.staff.track.index;
                        data[i++] = voice.bar.staff.index;
                        data[i++] = voice.bar.index;
                        data[i++] = voice.index;
                        data[i++] = model.index;
                        data[i++] = beat.onNotesX;
                        i = BoundsLookupWire._writeBounds(data, i, beat.visualBounds);
                        i = BoundsLookupWire._writeBounds(data, i, beat.realBounds);
                        const notes = beat.notes;
                        if (notes) {
                            data[i++] = notes.length;
                            for (const note of notes) {
                                data[i++] = note.note.index;
                                i = BoundsLookupWire._writeBounds(data, i, note.noteHeadBounds);
                            }
                        } else {
                            data[i++] = -1;
                        }
                    }
                }
            }
            data[blockStart] = i - blockStart;
        }
        return data;
    }

    public static decode(data: Float64Array, score: Score): BoundsLookup {
        const lookup = new BoundsLookup();
        const tracks = score.tracks;
        let i = 0;
        while (i < data.length) {
            i++; // blockLength
            const system = new StaffSystemBounds();
            system.visualBounds = BoundsLookupWire._readBounds(data, i);
            system.realBounds = BoundsLookupWire._readBounds(data, i + 4);
            i += 8;
            lookup.addStaffSystem(system);
            const masterBarCount = data[i++];
            for (let m = 0; m < masterBarCount; m++) {
                const masterBar = new MasterBarBounds();
                masterBar.index = data[i];
                masterBar.isFirstOfLine = data[i + 1] === 1;
                masterBar.lineAlignedBounds = BoundsLookupWire._readBounds(data, i + 2);
                masterBar.visualBounds = BoundsLookupWire._readBounds(data, i + 6);
                masterBar.realBounds = BoundsLookupWire._readBounds(data, i + 10);
                i += 14;
                lookup.addMasterBar(masterBar);
                const barCount = data[i++];
                for (let b = 0; b < barCount; b++) {
                    const bar = new BarBounds();
                    bar.bar = tracks[data[i]].staves[data[i + 1]].bars[data[i + 2]];
                    bar.visualBounds = BoundsLookupWire._readBounds(data, i + 3);
                    bar.realBounds = BoundsLookupWire._readBounds(data, i + 7);
                    i += 11;
                    masterBar.addBar(bar);
                    const beatCount = data[i++];
                    for (let k = 0; k < beatCount; k++) {
                        const beat = new BeatBounds();
                        beat.beat =
                            tracks[data[i]].staves[data[i + 1]].bars[data[i + 2]].voices[data[i + 3]].beats[
                                data[i + 4]
                            ];
                        beat.onNotesX = data[i + 5];
                        beat.visualBounds = BoundsLookupWire._readBounds(data, i + 6);
                        beat.realBounds = BoundsLookupWire._readBounds(data, i + 10);
                        i += 14;
                        const noteCount = data[i++];
                        if (noteCount >= 0) {
                            beat.notes = [];
                            const notes = beat.beat.notes;
                            for (let n = 0; n < noteCount; n++) {
                                const note = new NoteBounds();
                                note.note = notes[data[i]];
                                note.noteHeadBounds = BoundsLookupWire._readBounds(data, i + 1);
                                i += 5;
                                beat.addNote(note);
                            }
                        }
                        bar.addBeat(beat);
                    }
                }
            }
        }
        return lookup;
    }

    private static _encodedLength(lookup: BoundsLookup): number {
        let length = 0;
        for (const system of lookup.staffSystems) {
            length += BoundsLookupWire.systemSize;
            for (const masterBar of system.bars) {
                length += BoundsLookupWire.masterBarSize;
                for (const bar of masterBar.bars) {
                    length += BoundsLookupWire.barSize + bar.beats.length * BoundsLookupWire.beatSize;
                    for (const beat of bar.beats) {
                        if (beat.notes) {
                            length += beat.notes.length * BoundsLookupWire.noteSize;
                        }
                    }
                }
            }
        }
        return length;
    }

    private static _writeBounds(data: Float64Array, i: number, bounds: Bounds): number {
        data[i] = bounds.x;
        data[i + 1] = bounds.y;
        data[i + 2] = bounds.w;
        data[i + 3] = bounds.h;
        return i + 4;
    }

    private static _readBounds(data: Float64Array, i: number): Bounds {
        return new Bounds(data[i], data[i + 1], data[i + 2], data[i + 3]);
    }
}
