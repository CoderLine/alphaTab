import type { Bar } from '@coderline/alphatab/model/Bar';
import type { Beat } from '@coderline/alphatab/model/Beat';
import type { Note } from '@coderline/alphatab/model/Note';
import type { ScoreRenderer } from '@coderline/alphatab/rendering/ScoreRenderer';
import { BarBounds } from '@coderline/alphatab/rendering/utils/BarBounds';
import { BeatBounds } from '@coderline/alphatab/rendering/utils/BeatBounds';
import { Bounds } from '@coderline/alphatab/rendering/utils/Bounds';
import { BoundsLookup } from '@coderline/alphatab/rendering/utils/BoundsLookup';
import type { IBoundsLookupWriter } from '@coderline/alphatab/rendering/utils/IBoundsLookupWriter';
import { MasterBarBounds } from '@coderline/alphatab/rendering/utils/MasterBarBounds';
import { NoteBounds } from '@coderline/alphatab/rendering/utils/NoteBounds';
import { StaffSystemBounds } from '@coderline/alphatab/rendering/utils/StaffSystemBounds';

/**
 * Writes the bounds into {@link ScoreRenderer.boundsLookup}.
 * @internal
 */
export class BoundsLookupObjectWriter implements IBoundsLookupWriter {
    private _renderer: ScoreRenderer;
    private _system: StaffSystemBounds | null = null;
    private _masterBar: MasterBarBounds | null = null;
    private _bar: BarBounds | null = null;
    private _beat: BeatBounds | null = null;

    public constructor(renderer: ScoreRenderer) {
        this._renderer = renderer;
    }

    public get isFinished(): boolean {
        return this._renderer.boundsLookup!.isFinished;
    }

    public begin(partialUpdate: boolean): void {
        if (partialUpdate && this._renderer.boundsLookup) {
            this._renderer.boundsLookup.resetForPartialUpdate();
        } else {
            this._renderer.boundsLookup = new BoundsLookup();
        }
    }

    public clearFromMasterBar(masterBarIndex: number): void {
        this._renderer.boundsLookup!.clearFromMasterBar(masterBarIndex);
    }

    public finish(scale: number): void {
        this._renderer.boundsLookup?.finish(scale);
    }

    public beginStaffSystem(x: number, y: number, w: number, visualH: number, realH: number): void {
        const system = new StaffSystemBounds();
        system.visualBounds = new Bounds(x, y, w, visualH);
        system.realBounds = new Bounds(x, y, w, realH);
        this._renderer.boundsLookup!.addStaffSystem(system);
        this._system = system;
    }

    public openMasterBar(index: number, hint: number): boolean {
        const systemBars = this._system!.bars;
        if (hint >= 0 && hint < systemBars.length && systemBars[hint].index === index) {
            this._masterBar = systemBars[hint];
            return true;
        }
        for (const b of systemBars) {
            if (b.index === index) {
                this._masterBar = b;
                return true;
            }
        }
        return false;
    }

    public addMasterBar(
        index: number,
        isFirstOfLine: boolean,
        x: number,
        w: number,
        realY: number,
        realH: number,
        visualY: number,
        visualH: number,
        lineAlignedY: number,
        lineAlignedH: number
    ): void {
        const masterBar = new MasterBarBounds();
        masterBar.index = index;
        masterBar.isFirstOfLine = isFirstOfLine;
        masterBar.realBounds = new Bounds(x, realY, w, realH);
        masterBar.visualBounds = new Bounds(x, visualY, w, visualH);
        masterBar.lineAlignedBounds = new Bounds(x, lineAlignedY, w, lineAlignedH);
        this._system!.boundsLookup.addMasterBar(masterBar);
        this._masterBar = masterBar;
    }

    public addBar(bar: Bar, x: number, y: number, w: number, h: number): void {
        const barBounds = new BarBounds();
        barBounds.bar = bar;
        barBounds.visualBounds = new Bounds(x, y, w, h);
        barBounds.realBounds = new Bounds(x, y, w, h);
        this._masterBar!.addBar(barBounds);
        this._bar = barBounds;
    }

    public addBeat(beat: Beat, visualX: number, visualW: number, realX: number, realW: number, onNotesX: number): void {
        const bar = this._bar!;
        const beatBounds = new BeatBounds();
        beatBounds.beat = beat;
        beatBounds.visualBounds = new Bounds(visualX, bar.visualBounds.y, visualW, bar.visualBounds.h);
        beatBounds.realBounds = new Bounds(realX, bar.realBounds.y, realW, bar.realBounds.h);
        beatBounds.onNotesX = onNotesX;
        bar.addBeat(beatBounds);
        this._beat = beatBounds;
    }

    public addNote(note: Note, x: number, y: number, w: number, h: number): void {
        const noteBounds = new NoteBounds();
        noteBounds.note = note;
        noteBounds.noteHeadBounds = new Bounds(x, y, w, h);
        this._beat!.addNote(noteBounds);
    }

    public endBar(): void {
        this._bar!.sortBeats();
        this._bar = null;
        this._beat = null;
    }

    public endStaffSystem(): void {
        const system = this._system!;
        const systemBars = system.bars;
        for (let i = 0; i < systemBars.length; i++) {
            systemBars[i].sortBars();
        }
        // the bounds are built scaled and sorted: BoundsLookup.finish must not process them again
        system.isFinished = true;
        this._system = null;
        this._masterBar = null;
    }
}
