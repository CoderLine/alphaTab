import type { Beat } from '@src/model/Beat';
import type { MasterBar } from '@src/model/MasterBar';
import type { Note } from '@src/model/Note';
import type { Score } from '@src/model/Score';
import { BarBounds } from '@src/rendering/utils/BarBounds';
import { BeatBounds } from '@src/rendering/utils/BeatBounds';
import { Bounds } from '@src/rendering/utils/Bounds';
import { MasterBarBounds } from '@src/rendering/utils/MasterBarBounds';
import { NoteBounds } from '@src/rendering/utils/NoteBounds';
import { StaffSystemBounds } from '@src/rendering/utils/StaffSystemBounds';

export class BoundsLookup {
    /**
     * @target web
     */
    public toJson(): unknown {
        const json: any = {} as any;
        const systems: StaffSystemBounds[] = [];
        json.staffSystems = systems;
        for (const system of this.staffSystems) {
            const g: StaffSystemBounds = {} as any;
            g.visualBounds = this.boundsToJson(system.visualBounds);
            g.realBounds = this.boundsToJson(system.realBounds);
            g.bars = [];
            for (const masterBar of system.bars) {
                const mb: MasterBarBounds = {} as any;
                mb.lineAlignedBounds = this.boundsToJson(masterBar.lineAlignedBounds);
                mb.visualBounds = this.boundsToJson(masterBar.visualBounds);
                mb.realBounds = this.boundsToJson(masterBar.realBounds);
                mb.index = masterBar.index;
                mb.bars = [];
                for (const bar of masterBar.bars) {
                    const b: BarBounds = {} as any;
                    b.visualBounds = this.boundsToJson(bar.visualBounds);
                    b.realBounds = this.boundsToJson(bar.realBounds);
                    b.beats = [];
                    for (const beat of bar.beats) {
                        const bb: BeatBounds = {} as any;
                        bb.visualBounds = this.boundsToJson(beat.visualBounds);
                        bb.realBounds = this.boundsToJson(beat.realBounds);
                        bb.onNotesX = beat.onNotesX;
                        const bbd: any = bb;
                        bbd.beatIndex = beat.beat.index;
                        bbd.voiceIndex = beat.beat.voice.index;
                        bbd.barIndex = beat.beat.voice.bar.index;
                        bbd.staffIndex = beat.beat.voice.bar.staff.index;
                        bbd.trackIndex = beat.beat.voice.bar.staff.track.index;
                        if (beat.notes) {
                            const notes: NoteBounds[] = [];
                            bb.notes = notes;
                            for (const note of beat.notes) {
                                const n: NoteBounds = {} as any;
                                const nd: any = n;
                                nd.index = note.note.index;
                                n.noteHeadBounds = this.boundsToJson(note.noteHeadBounds);
                                notes.push(n);
                            }
                        }
                        b.beats.push(bb);
                    }
                    mb.bars.push(b);
                }
                g.bars.push(mb);
            }
            systems.push(g);
        }
        return json;
    }

    /**
     * @target web
     */
    public static fromJson(json: unknown, score: Score): BoundsLookup {
        const lookup: BoundsLookup = new BoundsLookup();
        const staffSystems: StaffSystemBounds[] = (json as any).staffSystems;
        for (const staffSystem of staffSystems) {
            const sg: StaffSystemBounds = new StaffSystemBounds();
            sg.visualBounds = BoundsLookup.boundsFromJson(staffSystem.visualBounds);
            sg.realBounds = BoundsLookup.boundsFromJson(staffSystem.realBounds);
            lookup.addStaffSystem(sg);
            for (const masterBar of staffSystem.bars) {
                const mb: MasterBarBounds = new MasterBarBounds();
                mb.index = masterBar.index;
                mb.isFirstOfLine = masterBar.isFirstOfLine;
                mb.lineAlignedBounds = BoundsLookup.boundsFromJson(masterBar.lineAlignedBounds);
                mb.visualBounds = BoundsLookup.boundsFromJson(masterBar.visualBounds);
                mb.realBounds = BoundsLookup.boundsFromJson(masterBar.realBounds);
                sg.addBar(mb);
                for (const bar of masterBar.bars) {
                    const b: BarBounds = new BarBounds();
                    b.visualBounds = BoundsLookup.boundsFromJson(bar.visualBounds);
                    b.realBounds = BoundsLookup.boundsFromJson(bar.realBounds);
                    mb.addBar(b);
                    for (const beat of bar.beats) {
                        const bb: BeatBounds = new BeatBounds();
                        bb.visualBounds = BoundsLookup.boundsFromJson(beat.visualBounds);
                        bb.realBounds = BoundsLookup.boundsFromJson(beat.realBounds);
                        bb.onNotesX = beat.onNotesX;
                        const bd: any = beat;
                        bb.beat =
                            score.tracks[bd.trackIndex].staves[bd.staffIndex].bars[bd.barIndex].voices[
                                bd.voiceIndex
                            ].beats[bd.beatIndex];
                        if (beat.notes) {
                            bb.notes = [];
                            for (const note of beat.notes) {
                                const n: NoteBounds = new NoteBounds();
                                const nd: any = note;
                                n.note = bb.beat.notes[nd.index];
                                n.noteHeadBounds = BoundsLookup.boundsFromJson(note.noteHeadBounds);
                                bb.addNote(n);
                            }
                        }
                        b.addBeat(bb);
                    }
                }
            }
        }
        return lookup;
    }

    /**
     * @target web
     */
    private static boundsFromJson(boundsRaw: Bounds): Bounds {
        // TODO: can we just set the right prototype here?
        // Object.setPrototypeOf(...)
        const b = new Bounds();
        b.x = boundsRaw.x;
        b.y = boundsRaw.y;
        b.w = boundsRaw.w;
        b.h = boundsRaw.h;
        return b;
    }

    /**
     * @target web
     */
    private boundsToJson(bounds: Bounds): Bounds {
        const json: Bounds = {} as any;
        json.x = bounds.x;
        json.y = bounds.y;
        json.w = bounds.w;
        json.h = bounds.h;
        return json;
    }

    private _beatLookup: Map<number, BeatBounds[]> = new Map();
    private _masterBarLookup: Map<number, MasterBarBounds> = new Map();
    private _currentStaffSystem: StaffSystemBounds | null = null;
    /**
     * Gets a list of all individual staff systems contained in the rendered music notation.
     */
    public staffSystems: StaffSystemBounds[] = [];

    /**
     * Gets or sets a value indicating whether this lookup was finished already.
     */
    public isFinished: boolean = false;

    /**
     * Finishes the lookup for optimized access.
     */
    public finish(scale: number = 1): void {
        for (const t of this.staffSystems) {
            t.finish(scale);
        }
        this.isFinished = true;
    }

    /**
     * Adds a new staff sytem to the lookup.
     * @param bounds The staff system bounds to add.
     */
    public addStaffSystem(bounds: StaffSystemBounds): void {
        bounds.index = this.staffSystems.length;
        bounds.boundsLookup = this;
        this.staffSystems.push(bounds);
        this._currentStaffSystem = bounds;
    }

    /**
     * Adds a new master bar to the lookup.
     * @param bounds The master bar bounds to add.
     */
    public addMasterBar(bounds: MasterBarBounds): void {
        if (!bounds.staffSystemBounds) {
            bounds.staffSystemBounds = this._currentStaffSystem!;
            this._masterBarLookup.set(bounds.index, bounds);
            this._currentStaffSystem!.addBar(bounds);
        } else {
            this._masterBarLookup.set(bounds.index, bounds);
        }
    }

    /**
     * Adds a new beat to the lookup.
     * @param bounds The beat bounds to add.
     */
    public addBeat(bounds: BeatBounds): void {
        if (!this._beatLookup.has(bounds.beat.id)) {
            this._beatLookup.set(bounds.beat.id, []);
        }
        this._beatLookup.get(bounds.beat.id)?.push(bounds);
    }

    /**
     * Tries to find the master bar bounds by a given index.
     * @param index The index of the master bar to find.
     * @returns The master bar bounds if it was rendered, or null if no boundary information is available.
     */
    public findMasterBarByIndex(index: number): MasterBarBounds | null {
        if (this._masterBarLookup.has(index)) {
            return this._masterBarLookup.get(index)!;
        }
        return null;
    }

    /**
     * Tries to find the master bar bounds by a given master bar.
     * @param bar The master bar to find.
     * @returns The master bar bounds if it was rendered, or null if no boundary information is available.
     */
    public findMasterBar(bar: MasterBar): MasterBarBounds | null {
        const id: number = bar.index;
        if (this._masterBarLookup.has(id)) {
            return this._masterBarLookup.get(id)!;
        }
        return null;
    }

    /**
     * Tries to find the bounds of a given beat.
     * @param beat The beat to find.
     * @returns The beat bounds if it was rendered, or null if no boundary information is available.
     */
    public findBeat(beat: Beat): BeatBounds | null {
        const all = this.findBeats(beat);
        return all ? all[0] : null;
    }

    /**
     * Tries to find the bounds of a given beat.
     * @param beat The beat to find.
     * @returns The beat bounds if it was rendered, or null if no boundary information is available.
     */
    public findBeats(beat: Beat): BeatBounds[] | null {
        const id: number = beat.id;
        if (this._beatLookup.has(id)) {
            return this._beatLookup.get(id)!;
        }
        return null;
    }

    /**
     * Tries to find a beat at the given absolute position.
     * @param x The absolute X-position of the beat to find.
     * @param y The absolute Y-position of the beat to find.
     * @returns The beat found at the given position or null if no beat could be found.
     */
    public getBeatAtPos(x: number, y: number): Beat | null {
        //
        // find a bar which matches in y-axis
        let bottom: number = 0;
        let top: number = this.staffSystems.length - 1;
        let staffSystemIndex: number = -1;
        while (bottom <= top) {
            const middle: number = ((top + bottom) / 2) | 0;
            const system: StaffSystemBounds = this.staffSystems[middle];
            // found?
            if (y >= system.realBounds.y && y <= system.realBounds.y + system.realBounds.h) {
                staffSystemIndex = middle;
                break;
            }
            // search in lower half
            if (y < system.realBounds.y) {
                top = middle - 1;
            } else {
                bottom = middle + 1;
            }
        }
        // no bar found
        if (staffSystemIndex === -1) {
            return null;
        }
        //
        // Find the matching bar in the row
        const staffSystem: StaffSystemBounds = this.staffSystems[staffSystemIndex];
        const bar: MasterBarBounds | null = staffSystem.findBarAtPos(x);
        if (bar) {
            return bar.findBeatAtPos(x, y);
        }
        return null;
    }

    /**
     * Tries to find the note at the given position using the given beat for fast access.
     * Use {@link findBeat} to find a beat for a given position first.
     * @param beat The beat containing the note.
     * @param x The X-position of the note.
     * @param y The Y-position of the note.
     * @returns The note at the given position within the beat.
     */
    public getNoteAtPos(beat: Beat, x: number, y: number): Note | null {
        const beatBounds = this.findBeats(beat);
        if (beatBounds) {
            for (const b of beatBounds) {
                const note = b.findNoteAtPos(x, y);
                if (note) {
                    return note;
                }
            }
        }
        return null;
    }
}
