import type { Beat } from '@coderline/alphatab/model/Beat';
import type { MasterBar } from '@coderline/alphatab/model/MasterBar';
import type { Note } from '@coderline/alphatab/model/Note';
import type { Score } from '@coderline/alphatab/model/Score';
import { BarBounds } from '@coderline/alphatab/rendering/utils/BarBounds';
import { BeatBounds } from '@coderline/alphatab/rendering/utils/BeatBounds';
import { Bounds } from '@coderline/alphatab/rendering/utils/Bounds';
import { MasterBarBounds } from '@coderline/alphatab/rendering/utils/MasterBarBounds';
import { NoteBounds } from '@coderline/alphatab/rendering/utils/NoteBounds';
import { StaffSystemBounds } from '@coderline/alphatab/rendering/utils/StaffSystemBounds';

/**
 * @public
 */
export class BoundsLookup {
    public toJson(): Map<string, unknown> {
        const json = new Map<string, unknown>();
        const systems: Map<string, unknown>[] = [];
        json.set('staffSystems', systems);
        for (const system of this.staffSystems) {
            const g = new Map<string, unknown>();
            g.set('visualBounds', BoundsLookup._boundsToJson(system.visualBounds));
            g.set('realBounds', BoundsLookup._boundsToJson(system.realBounds));
            const gBars: Map<string, unknown>[] = [];
            g.set('bars', gBars);

            for (const masterBar of system.bars) {
                const mb = new Map<string, unknown>();
                mb.set('lineAlignedBounds', BoundsLookup._boundsToJson(masterBar.lineAlignedBounds));
                mb.set('visualBounds', BoundsLookup._boundsToJson(masterBar.visualBounds));
                mb.set('realBounds', BoundsLookup._boundsToJson(masterBar.realBounds));
                mb.set('index', masterBar.index);
                mb.set('isFirstOfLine', masterBar.isFirstOfLine);
                const mbBars: Map<string, unknown>[] = [];
                mb.set('bars', mbBars);
                for (const bar of masterBar.bars) {
                    const b = new Map<string, unknown>();
                    b.set('visualBounds', BoundsLookup._boundsToJson(bar.visualBounds));
                    b.set('realBounds', BoundsLookup._boundsToJson(bar.realBounds));
                    const bBeats: Map<string, unknown>[] = [];
                    b.set('beats', bBeats);
                    for (const beat of bar.beats) {
                        const bb = new Map<string, unknown>();
                        bb.set('visualBounds', BoundsLookup._boundsToJson(beat.visualBounds));
                        bb.set('realBounds', BoundsLookup._boundsToJson(beat.realBounds));
                        bb.set('onNotesX', beat.onNotesX);
                        bb.set('beatIndex', beat.beat.index);
                        bb.set('voiceIndex', beat.beat.voice.index);
                        bb.set('barIndex', beat.beat.voice.bar.index);
                        bb.set('staffIndex', beat.beat.voice.bar.staff.index);
                        bb.set('trackIndex', beat.beat.voice.bar.staff.track.index);
                        if (beat.notes) {
                            const notes: Map<string, unknown>[] = [];
                            bb.set('notes', notes);
                            for (const note of beat.notes) {
                                const n = new Map<string, unknown>();
                                n.set('index', note.note.index);
                                n.set('noteHeadBounds', BoundsLookup._boundsToJson(note.noteHeadBounds));
                                notes.push(n);
                            }
                        }
                        bBeats.push(bb);
                    }
                    mbBars.push(b);
                }
                gBars.push(mb);
            }
            systems.push(g);
        }
        return json;
    }

    public static fromJson(json: Map<string, unknown> | null, score: Score): BoundsLookup | null {
        if (json === null) {
            return null;
        }
        const lookup: BoundsLookup = new BoundsLookup();
        const staffSystems = json.get('staffSystems')! as Map<string, unknown>[];
        for (const staffSystem of staffSystems) {
            const sg: StaffSystemBounds = new StaffSystemBounds();
            sg.visualBounds = BoundsLookup._boundsFromJson(staffSystem.get('visualBounds') as Map<string, unknown>);
            sg.realBounds = BoundsLookup._boundsFromJson(staffSystem.get('realBounds') as Map<string, unknown>);
            lookup.addStaffSystem(sg);
            for (const masterBar of staffSystem.get('bars') as Map<string, unknown>[]) {
                const mb: MasterBarBounds = new MasterBarBounds();
                mb.index = masterBar.get('index') as number;
                mb.isFirstOfLine = masterBar.get('isFirstOfLine') as boolean;
                mb.lineAlignedBounds = BoundsLookup._boundsFromJson(
                    masterBar.get('lineAlignedBounds') as Map<string, unknown>
                );
                mb.visualBounds = BoundsLookup._boundsFromJson(masterBar.get('visualBounds') as Map<string, unknown>);
                mb.realBounds = BoundsLookup._boundsFromJson(masterBar.get('realBounds') as Map<string, unknown>);
                lookup.addMasterBar(mb);
                for (const bar of masterBar.get('bars') as Map<string, unknown>[]) {
                    const b: BarBounds = new BarBounds();
                    b.visualBounds = BoundsLookup._boundsFromJson(bar.get('visualBounds') as Map<string, unknown>);
                    b.realBounds = BoundsLookup._boundsFromJson(bar.get('realBounds') as Map<string, unknown>);
                    mb.addBar(b);
                    for (const beat of bar.get('beats') as Map<string, unknown>[]) {
                        const bb: BeatBounds = new BeatBounds();
                        bb.visualBounds = BoundsLookup._boundsFromJson(
                            beat.get('visualBounds') as Map<string, unknown>
                        );
                        bb.realBounds = BoundsLookup._boundsFromJson(beat.get('realBounds') as Map<string, unknown>);
                        bb.onNotesX = beat.get('onNotesX') as number;
                        bb.beat =
                            score.tracks[beat.get('trackIndex') as number].staves[
                                beat.get('staffIndex') as number
                            ].bars[beat.get('barIndex') as number].voices[beat.get('voiceIndex') as number].beats[
                                beat.get('beatIndex') as number
                            ];
                        if (beat.has('notes')) {
                            bb.notes = [];
                            for (const note of beat.get('notes') as Map<string, unknown>[]) {
                                const n: NoteBounds = new NoteBounds();
                                n.note = bb.beat.notes[note.get('index') as number];
                                n.noteHeadBounds = BoundsLookup._boundsFromJson(
                                    note.get('noteHeadBounds') as Map<string, unknown>
                                );
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

    private static _boundsFromJson(boundsRaw: Map<string, unknown>): Bounds {
        const b = new Bounds();
        b.x = boundsRaw.get('x') as number;
        b.y = boundsRaw.get('y') as number;
        b.w = boundsRaw.get('w') as number;
        b.h = boundsRaw.get('h') as number;
        return b;
    }

    private static _boundsToJson(bounds: Bounds): Map<string, unknown> {
        const json = new Map<string, unknown>();
        json.set('x', bounds.x);
        json.set('y', bounds.y);
        json.set('w', bounds.w);
        json.set('h', bounds.h);
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
            return bar.findBeatAtPos(x);
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
