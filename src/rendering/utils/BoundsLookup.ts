import { Beat } from '@src/model/Beat';
import { MasterBar } from '@src/model/MasterBar';
import { Note } from '@src/model/Note';
import { Score } from '@src/model/Score';
import { BarBounds } from '@src/rendering/utils/BarBounds';
import { BeatBounds } from '@src/rendering/utils/BeatBounds';
import { Bounds } from '@src/rendering/utils/Bounds';
import { MasterBarBounds } from '@src/rendering/utils/MasterBarBounds';
import { NoteBounds } from '@src/rendering/utils/NoteBounds';
import { StaveGroupBounds } from '@src/rendering/utils/StaveGroupBounds';

export class BoundsLookup {
    /**
     * @target web
     */
    public toJson(): unknown {
        let json: any = {} as any;
        let staveGroups: StaveGroupBounds[] = [];
        json.staveGroups = staveGroups;
        for (let group of this.staveGroups) {
            let g: StaveGroupBounds = {} as any;
            g.visualBounds = this.boundsToJson(group.visualBounds);
            g.realBounds = this.boundsToJson(group.realBounds);
            g.bars = [];
            for (let masterBar of group.bars) {
                let mb: MasterBarBounds = {} as any;
                mb.lineAlignedBounds = this.boundsToJson(masterBar.lineAlignedBounds);
                mb.visualBounds = this.boundsToJson(masterBar.visualBounds);
                mb.realBounds = this.boundsToJson(masterBar.realBounds);
                mb.index = masterBar.index;
                mb.bars = [];
                for (let bar of masterBar.bars) {
                    let b: BarBounds = {} as any;
                    b.visualBounds = this.boundsToJson(bar.visualBounds);
                    b.realBounds = this.boundsToJson(bar.realBounds);
                    b.beats = [];
                    for (let beat of bar.beats) {
                        let bb: BeatBounds = {} as any;
                        bb.visualBounds = this.boundsToJson(beat.visualBounds);
                        bb.realBounds = this.boundsToJson(beat.realBounds);
                        let bbd: any = bb;
                        bbd.beatIndex = beat.beat.index;
                        bbd.voiceIndex = beat.beat.voice.index;
                        bbd.barIndex = beat.beat.voice.bar.index;
                        bbd.staffIndex = beat.beat.voice.bar.staff.index;
                        bbd.trackIndex = beat.beat.voice.bar.staff.track.index;
                        if (beat.notes) {
                            let notes: NoteBounds[] = (bb.notes = []);
                            for (let note of beat.notes) {
                                let n: NoteBounds = {} as any;
                                let nd: any = n;
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
            staveGroups.push(g);
        }
        return json;
    }

    /**
     * @target web
     */
    public static fromJson(json: unknown, score: Score): BoundsLookup {
        let lookup: BoundsLookup = new BoundsLookup();
        let staveGroups: StaveGroupBounds[] = (json as any)['staveGroups'];
        for (let staveGroup of staveGroups) {
            let sg: StaveGroupBounds = new StaveGroupBounds();
            sg.visualBounds = staveGroup.visualBounds;
            sg.realBounds = staveGroup.realBounds;
            lookup.addStaveGroup(sg);
            for (let masterBar of staveGroup.bars) {
                let mb: MasterBarBounds = new MasterBarBounds();
                mb.index = masterBar.index;
                mb.isFirstOfLine = masterBar.isFirstOfLine;
                mb.lineAlignedBounds = masterBar.lineAlignedBounds;
                mb.visualBounds = masterBar.visualBounds;
                mb.realBounds = masterBar.realBounds;
                sg.addBar(mb);
                for (let bar of masterBar.bars) {
                    let b: BarBounds = new BarBounds();
                    b.visualBounds = bar.visualBounds;
                    b.realBounds = bar.realBounds;
                    mb.addBar(b);
                    for (let beat of bar.beats) {
                        let bb: BeatBounds = new BeatBounds();
                        bb.visualBounds = beat.visualBounds;
                        bb.realBounds = beat.realBounds;
                        let bd: any = beat;
                        bb.beat =
                            score.tracks[bd.trackIndex].staves[bd.staffIndex].bars[bd.barIndex].voices[
                                bd.voiceIndex
                            ].beats[bd.beatIndex];
                        if (beat.notes) {
                            bb.notes = [];
                            for (let note of beat.notes) {
                                let n: NoteBounds = new NoteBounds();
                                let nd: any = note;
                                n.note = bb.beat.notes[nd.index];
                                n.noteHeadBounds = note.noteHeadBounds;
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
    private boundsToJson(bounds: Bounds): Bounds {
        let json: Bounds = {} as any;
        json.x = bounds.x;
        json.y = bounds.y;
        json.w = bounds.w;
        json.h = bounds.h;
        return json;
    }

    private _beatLookup: Map<number, BeatBounds> = new Map();
    private _masterBarLookup: Map<number, MasterBarBounds> = new Map();
    private _currentStaveGroup: StaveGroupBounds | null = null;
    /**
     * Gets a list of all individual stave groups contained in the rendered music notation.
     */
    public staveGroups: StaveGroupBounds[] = [];

    /**
     * Gets or sets a value indicating whether this lookup was finished already.
     */
    public isFinished: boolean = false;

    /**
     * Finishes the lookup for optimized access.
     */
    public finish(): void {
        for (let t of this.staveGroups) {
            t.finish();
        }
        this.isFinished = true;
    }

    /**
     * Adds a new note to the lookup.
     * @param bounds The note bounds to add.
     */
    public addNote(bounds: NoteBounds): void {
        let beat = this.findBeat(bounds.note.beat);
        beat!.addNote(bounds);
    }

    /**
     * Adds a new stave group to the lookup.
     * @param bounds The stave group bounds to add.
     */
    public addStaveGroup(bounds: StaveGroupBounds): void {
        bounds.index = this.staveGroups.length;
        bounds.boundsLookup = this;
        this.staveGroups.push(bounds);
        this._currentStaveGroup = bounds;
    }

    /**
     * Adds a new master bar to the lookup.
     * @param bounds The master bar bounds to add.
     */
    public addMasterBar(bounds: MasterBarBounds): void {
        if (!bounds.staveGroupBounds) {
            bounds.staveGroupBounds = this._currentStaveGroup!;
            this._masterBarLookup.set(bounds.index, bounds);
            this._currentStaveGroup!.addBar(bounds);
        } else {
            this._masterBarLookup.set(bounds.index, bounds);
        }
    }

    /**
     * Adds a new beat to the lookup.
     * @param bounds The beat bounds to add.
     */
    public addBeat(bounds: BeatBounds): void {
        this._beatLookup.set(bounds.beat.id, bounds);
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
        let id: number = bar.index;
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
        let id: number = beat.id;
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
        let top: number = this.staveGroups.length - 1;
        let staveGroupIndex: number = -1;
        while (bottom <= top) {
            let middle: number = ((top + bottom) / 2) | 0;
            let group: StaveGroupBounds = this.staveGroups[middle];
            // found?
            if (y >= group.realBounds.y && y <= group.realBounds.y + group.realBounds.h) {
                staveGroupIndex = middle;
                break;
            }
            // search in lower half
            if (y < group.realBounds.y) {
                top = middle - 1;
            } else {
                bottom = middle + 1;
            }
        }
        // no bar found
        if (staveGroupIndex === -1) {
            return null;
        }
        //
        // Find the matching bar in the row
        let staveGroup: StaveGroupBounds = this.staveGroups[staveGroupIndex];
        let bar: MasterBarBounds | null = staveGroup.findBarAtPos(x);
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
        let beatBounds: BeatBounds | null = this.findBeat(beat);
        if (!beatBounds) {
            return null;
        }
        return beatBounds.findNoteAtPos(x, y);
    }
}
