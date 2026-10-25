import type { Beat } from '@coderline/alphatab/model/Beat';
import type { GraceGroup } from '@coderline/alphatab/model/GraceGroup';
import type { GraceType } from '@coderline/alphatab/model/GraceType';
import { ModelUtils } from '@coderline/alphatab/model/ModelUtils';
import type { Note } from '@coderline/alphatab/model/Note';
import type { TupletGroup } from '@coderline/alphatab/model/TupletGroup';
import type { ICanvas } from '@coderline/alphatab/platform/ICanvas';
import type { NoteXPosition, NoteYPosition } from '@coderline/alphatab/rendering/BarRendererBase';
import { BeatXPosition } from '@coderline/alphatab/rendering/BeatXPosition';
import type { BeatGlyphBase } from '@coderline/alphatab/rendering/glyphs/BeatGlyphBase';
import type { BeatOnNoteGlyphBase } from '@coderline/alphatab/rendering/glyphs/BeatOnNoteGlyphBase';
import { Glyph } from '@coderline/alphatab/rendering/glyphs/Glyph';
import type { ITieGlyph } from '@coderline/alphatab/rendering/glyphs/TieGlyph';
import type { LineBarRenderer } from '@coderline/alphatab/rendering/LineBarRenderer';
import type { BarLayoutingInfo } from '@coderline/alphatab/rendering/staves/BarLayoutingInfo';
import type { BarBounds } from '@coderline/alphatab/rendering/utils/BarBounds';
import type { BeamingHelper } from '@coderline/alphatab/rendering/utils/BeamingHelper';
import { BeatBounds } from '@coderline/alphatab/rendering/utils/BeatBounds';
import { Bounds } from '@coderline/alphatab/rendering/utils/Bounds';

/**
 * Per-beat effect-glyph overflow; consumed by the per-beat skyline emission
 * walk in {@link BarRendererBase.scaleToWidth}.
 *
 * @record
 * @internal
 */
export interface BeatEffectOverflow {
    minY: number;
    maxY: number;
}

/**
 * @internal
 */
export abstract class BeatContainerGlyphBase extends Glyph {
    private _pendingEffectOverflows: BeatEffectOverflow[] | null = null;

    public get pendingEffectOverflows(): BeatEffectOverflow[] {
        let pending = this._pendingEffectOverflows;
        if (!pending) {
            pending = [];
            this._pendingEffectOverflows = pending;
        }
        return pending;
    }

    /** {@link pendingEffectOverflows} without creating the list; `null` when nothing was registered. */
    public get pendingEffectOverflowsOrNull(): BeatEffectOverflow[] | null {
        return this._pendingEffectOverflows;
    }

    /** Drain pending overflows before the next producer pass; consumer may not run. */
    public prepareForOverflowPass(): void {
        const pending = this._pendingEffectOverflows;
        if (pending && pending.length > 0) {
            pending.splice(0, pending.length);
        }
    }

    public abstract get beatId(): number;
    public abstract get absoluteDisplayStart(): number;
    public abstract get displayDuration(): number;
    public abstract get onTimeX(): number;
    public abstract get graceType(): GraceType;
    public abstract get graceIndex(): number;
    public abstract get graceGroup(): GraceGroup | null;
    public abstract get voiceIndex(): number;
    public abstract get isFirstOfTupletGroup(): boolean;
    public abstract get tupletGroup(): TupletGroup | null;
    public abstract get isLastOfVoice(): boolean;
    public abstract getNoteY(note: Note, requestedPosition: NoteYPosition): number;
    public abstract doMultiVoiceLayout(): void;
    public abstract getRestY(requestedPosition: NoteYPosition): number;
    public abstract getNoteX(note: Note, requestedPosition: NoteXPosition): number;
    public abstract getBeatX(requestedPosition: BeatXPosition, useSharedSizes: boolean): number;
    public abstract getLowestNoteY(requestedPosition: NoteYPosition): number;
    public abstract getHighestNoteY(requestedPosition: NoteYPosition): number;
    public abstract registerLayoutingInfo(layoutings: BarLayoutingInfo): void;
    public abstract applyLayoutingInfo(info: BarLayoutingInfo): void;
    public abstract buildBoundingsLookup(barBounds: BarBounds, cx: number, cy: number): void;
    public scaleToWidth(beatWidth: number) {
        this.width = beatWidth;
    }

    /**
     * Repositions this beat so its {@link onTimeX} anchor lands at `target`, used for the
     * centered full-bar note/rest (see {@link BarLayoutingInfo.isCenteredFullBar}). The default
     * shifts the whole container, matching the regular (non-centered) positioning formula.
     * {@link BeatContainerGlyph} overrides this to shift only its ink, keeping `x`/`width`
     * spanning the full bar so bounds lookups and skyline emission stay correct.
     */
    public applyCenterOffset(target: number): void {
        this.x = target - this.onTimeX;
    }
}

/**
 * @internal
 */
export class BeatContainerGlyph extends BeatContainerGlyphBase {
    private _ties: ITieGlyph[] | null = null;
    private _tieWidth = 0;
    public beat: Beat;
    public preNotes!: BeatGlyphBase;
    public onNotes!: BeatOnNoteGlyphBase;

    public override getLowestNoteY(requestedPosition: NoteYPosition): number {
        return this.onNotes.getLowestNoteY(requestedPosition);
    }

    public override getHighestNoteY(requestedPosition: NoteYPosition): number {
        return this.onNotes.getHighestNoteY(requestedPosition);
    }

    public override get beatId(): number {
        return this.beat.id;
    }

    public override get isLastOfVoice(): boolean {
        return this.beat.isLastOfVoice;
    }

    public override get displayDuration(): number {
        return this.beat.displayDuration;
    }

    public override get graceIndex(): number {
        return this.beat.graceIndex;
    }

    public override get graceType(): GraceType {
        return this.beat.graceType;
    }

    public override get absoluteDisplayStart(): number {
        return this.beat.absoluteDisplayStart;
    }

    public override get graceGroup(): GraceGroup | null {
        return this.beat.graceGroup;
    }

    public override get voiceIndex(): number {
        return this.beat.voice.index;
    }

    public override get isFirstOfTupletGroup(): boolean {
        return this.beat.hasTuplet && this.beat.tupletGroup!.beats[0].id === this.beat.id;
    }

    public override get tupletGroup(): TupletGroup | null {
        return this.beat.tupletGroup;
    }

    public get onTimeX(): number {
        return this.onNotes.x + this.onNotes.onTimeX;
    }

    public constructor(beat: Beat) {
        super(0, 0);
        this.beat = beat;
    }

    public override getNoteY(note: Note, requestedPosition: NoteYPosition): number {
        return this.onNotes.y + this.onNotes.getNoteY(note, requestedPosition);
    }

    public override getRestY(requestedPosition: NoteYPosition): number {
        return this.onNotes.y + this.onNotes.getRestY(requestedPosition);
    }

    public override getNoteX(note: Note, requestedPosition: NoteXPosition): number {
        return this.onNotes.x + this.onNotes.getNoteX(note, requestedPosition);
    }

    public addTie(tie: ITieGlyph) {
        const tg = tie as unknown as Glyph;
        tg.renderer = this.renderer;
        if (!this._ties) {
            this._ties = [];
        }
        this._ties.push(tie);
        this.renderer.registerTie(tie);
    }

    /**
     * Vertical extent of {@link preNotes} and {@link onNotes}. Their glyphs only move vertically in
     * {@link doLayout} and {@link doMultiVoiceLayout}, which invalidate the cache when done.
     * Horizontal positioning (layouting info, scaling, centering) keeps it valid.
     */
    private _noteExtentValid = false;
    private _noteExtentTop = 0;
    private _noteExtentBottom = 0;

    protected invalidateNoteExtent(): void {
        this._noteExtentValid = false;
    }

    private _updateNoteExtent(): void {
        let top = ModelUtils.minBoundingBox(this.preNotes.getBoundingBoxTop(), this.onNotes.getBoundingBoxTop());
        if (Number.isNaN(top)) {
            top = (this.renderer as LineBarRenderer).middleYPosition;
        }
        let bottom = ModelUtils.maxBoundingBox(
            this.preNotes.getBoundingBoxBottom(),
            this.onNotes.getBoundingBoxBottom()
        );
        if (Number.isNaN(bottom)) {
            bottom = (this.renderer as LineBarRenderer).middleYPosition;
        }
        this._noteExtentTop = top;
        this._noteExtentBottom = bottom;
        this._noteExtentValid = true;
    }

    public override getBoundingBoxTop(): number {
        if (!this._noteExtentValid) {
            this._updateNoteExtent();
        }
        return this._noteExtentTop;
    }

    public override getBoundingBoxBottom(): number {
        if (!this._noteExtentValid) {
            this._updateNoteExtent();
        }
        return this._noteExtentBottom;
    }

    protected drawBeamHelperAsFlags(helper: BeamingHelper): boolean {
        return helper.hasFlag(false, undefined);
    }

    protected get postBeatStretch() {
        return this.onNotes.computedWidth + this._tieWidth - this.onNotes.onTimeX;
    }

    public registerLayoutingInfo(layoutings: BarLayoutingInfo): void {
        const preBeatStretch: number = this.preNotes.computedWidth + this.onNotes.onTimeX;

        let postBeatStretch: number = this.postBeatStretch;

        const ties = this._ties;
        if (ties) {
            for (const tie of ties) {
                const tg = tie as unknown as Glyph;
                postBeatStretch += tg.width;
            }
        }

        layoutings.addBeatSpring(this, preBeatStretch, postBeatStretch);

        // store sizes for usages in effects
        // we might have empty content in the individual bar renderers, but need to know
        // the "shared" maximum widths
        layoutings.setBeatSizes(this, {
            preBeatSize: this.preNotes.width,
            onBeatSize: this.onNotes.width
        });
    }

    public applyLayoutingInfo(_info: BarLayoutingInfo): void {
        this.updateWidth();
    }

    public override doLayout(): void {
        this.preNotes.x = 0;
        this.preNotes.renderer = this.renderer;
        this.preNotes.container = this;
        this.preNotes.doLayout();
        // preNotes.width is only final once preNotes.doLayout() has run, so onNotes.x must be
        // derived here, not before.
        this._layoutOnsetX();
        this.onNotes.renderer = this.renderer;
        this.onNotes.container = this;
        this.onNotes.doLayout();
        this.createBeatTies();
        this.updateWidth();
        this.invalidateNoteExtent();
    }

    /**
     * Resets `preNotes.x`/`onNotes.x` to their natural (un-centered) baseline.
     * Shared by {@link doLayout} and {@link applyCenterOffset} so the latter can be called
     * repeatedly (once per `_scaleToForce` pass) without compounding a previous offset.
     */
    private _layoutOnsetX(): void {
        this.preNotes.x = 0;
        this.onNotes.x = this.preNotes.x + this.preNotes.width;
    }

    public override applyCenterOffset(target: number): void {
        this._layoutOnsetX();
        const offset = target - this.onTimeX;
        this.preNotes.x = offset;
        this.onNotes.x = this.preNotes.x + this.preNotes.width;
    }

    protected createBeatTies() {
        let i: number = this.beat.notes.length - 1;
        while (i >= 0) {
            this.createTies(this.beat.notes[i--]);
        }
    }

    /** Overrides that move note glyphs vertically must call {@link invalidateNoteExtent} when done. */
    public override doMultiVoiceLayout(): void {
        // do nothing by default, overridden when needed
    }

    protected updateWidth(): void {
        let width = this.preNotes.width + this.onNotes.width;
        let tieWidth: number = 0;
        const ties = this._ties;
        if (ties) {
            for (const tie of ties) {
                const tg = tie as unknown as Glyph;
                if (tg.width > tieWidth) {
                    tieWidth = tg.width;
                }
            }
        }
        this._tieWidth = tieWidth;
        width += tieWidth;
        this.width = width;
    }

    protected createTies(_n: Note): void {
        // no default ties
    }

    public static getGroupId(beat: Beat): string {
        return `b${beat.id}`;
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        // var c = canvas.color;
        // canvas.color = Color.random();
        // canvas.fillRect(cx + this.x, cy + this.y + this.preNotes.getBoundingBoxTop(), this.width, this.renderer.height);
        // canvas.fillRect(cx + this.x, cy + this.y + this.onNotes.getBoundingBoxTop(), this.width, this.renderer.height);
        // canvas.color = Color.random();
        // const top = this.getBoundingBoxTop();
        // const bottom = this.getBoundingBoxBottom();
        // canvas.fillRect(cx + this.x, cy + this.y + top, this.width, bottom-top);
        // canvas.color = c;

        // var c = canvas.color;
        // var ta = canvas.textAlign;
        // canvas.color = new Color(255, 0, 0);
        // canvas.textAlign = TextAlign.Left;
        // canvas.fillText(this.beat.playbackStart.toString(), cx + this.x, cy + this.y - 10);
        // canvas.color = c;
        // canvas.textAlign = ta;
        // canvas.color = Color.random();
        // canvas.fillRect(cx + this.x, cy + this.y, this.width, this.renderer.height);
        // var oldColor = canvas.color;
        // canvas.color = Color.random(100);
        // canvas.fillRect(cx + this.x, cy + this.y, this.width, this.renderer.height);
        // canvas.color = oldColor;
        // canvas.color = new Color(200, 0, 0, 100);
        // canvas.strokeRect(cx + this.x, cy + this.y + 15 * this.beat.voice.index, this.width, 10);
        // canvas.font = new Font("Arial", 10);
        // canvas.color = new Color(0, 0, 0);
        // canvas.fillText(this.beat.voice.index + ":" + this.beat.index, cx + this.x, cy + this.y + 15 * this.beat.voice.index);

        // const c = canvas.color;
        // if (this.beat.voice.index === 0) {
        //     canvas.color = new Color(0, 0, 200, 100);
        //     canvas.strokeRect(cx + this.x, cy + this.y, this.width, 10);

        //     canvas.color = new Color(200, 0, 0, 100);
        //     canvas.strokeRect(cx + this.x + this.preNotes.x, cy + this.y + 10, this.preNotes.width, 10);

        // canvas.color = new Color(0, 200, 0, 100);
        // canvas.strokeRect(
        //     cx + this.x + this.onNotes.x,
        //     cy + this.y + this.beat.voice.index * 1,
        //     this.onNotes.width,
        //     10
        // );

        //     canvas.color = new Color(0, 200, 200, 100);
        //     canvas.strokeRect(cx + this.x  + this.onNotes.x + this.onNotes.centerX, cy, 1, this.renderer.height);
        // }
        // canvas.color = c;

        const ties = this._ties;
        const isEmptyGlyph: boolean = this.preNotes.isEmpty && this.onNotes.isEmpty && (!ties || ties.length === 0);
        if (isEmptyGlyph) {
            return;
        }
        canvas.beginGroup(BeatContainerGlyph.getGroupId(this.beat));

        const x = cx + this.x;
        const y = cy + this.y;
        this.preNotes.paint(x, y, canvas);
        this.onNotes.paint(x, y, canvas);

        // reason: we have possibly multiple staves involved and need to calculate the correct positions.
        const staffX: number = cx - this.renderer.beatGlyphsStart - this.renderer.x;
        const staffY: number = cy - this.renderer.y;
        if (ties) {
            for (let i: number = 0, j: number = ties.length; i < j; i++) {
                const t = ties[i] as unknown as Glyph;
                t.renderer = this.renderer;
                t.paint(staffX, staffY, canvas);
            }
        }
        canvas.endGroup();
    }

    public buildBoundingsLookup(barBounds: BarBounds, cx: number, cy: number) {
        const scale = this.renderer.settings.display.scale;
        const x = cx + this.x;
        let visualX = x;
        let visualW = this.width;
        if (!this.beat.isEmpty) {
            if (!this.preNotes.isEmpty) {
                visualX = x + this.preNotes.x;
            } else if (!this.onNotes.isEmpty) {
                visualX = x + this.onNotes.x;
            }

            let visualEndX = 0;
            if (!this.onNotes.isEmpty) {
                visualEndX = x + this.onNotes.x + this.onNotes.onTimeX + this.postBeatStretch;
            } else if (!this.preNotes.isEmpty) {
                visualEndX = x + this.preNotes.x + this.preNotes.width;
            } else {
                visualEndX = x + this.width;
            }
            visualW = visualEndX - visualX;
        }
        visualW = this.getBoundsVisualWidth(visualX, visualW);
        const realW = this.getBoundsRealWidth(x, this.width);

        const beatBoundings: BeatBounds = new BeatBounds();
        beatBoundings.beat = this.beat;
        beatBoundings.visualBounds = new Bounds(
            visualX * scale,
            barBounds.visualBounds.y,
            visualW * scale,
            barBounds.visualBounds.h
        );
        beatBoundings.realBounds = new Bounds(x * scale, barBounds.realBounds.y, realW * scale, barBounds.realBounds.h);
        beatBoundings.onNotesX = (x + this.onNotes.x + this.onNotes.onTimeX) * scale;

        barBounds.addBeat(beatBoundings);

        if (this.renderer.settings.core.includeNoteBounds) {
            this.onNotes.buildBoundingsLookup(beatBoundings, x, cy + this.y);
        }
    }

    /**
     * The unscaled width of the visual beat bounds starting at `visualX`.
     * @param width The width covered by the beat glyphs.
     */
    protected getBoundsVisualWidth(_visualX: number, width: number): number {
        return width;
    }

    /**
     * The unscaled width of the real beat bounds starting at `realX`.
     * @param width The width of the beat container.
     */
    protected getBoundsRealWidth(_realX: number, width: number): number {
        return width;
    }

    public getBeatX(requestedPosition: BeatXPosition, useSharedSizes: boolean = false) {
        switch (requestedPosition) {
            case BeatXPosition.PreNotes:
                return this.preNotes.x;
            case BeatXPosition.OnNotes:
                return this.onNotes.x;
            case BeatXPosition.MiddleNotes:
                return this.onNotes.x + this.onNotes.middleX;
            case BeatXPosition.Stem:
                return this.onNotes.x + this.onNotes.stemX;
            case BeatXPosition.PostNotes:
                const onNoteSize = useSharedSizes
                    ? (this.renderer.layoutingInfo.getBeatSizes(this.beat)?.onBeatSize ?? this.onNotes.width)
                    : this.onNotes.width;
                return this.onNotes.x + onNoteSize;
            case BeatXPosition.EndBeat:
                return this.width;
        }
        return this.preNotes.x;
    }
}
