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
import type { BarLayoutingInfo } from '@coderline/alphatab/rendering/staves/BarLayoutingInfo';
import type { BarBounds } from '@coderline/alphatab/rendering/utils/BarBounds';
import type { BeamingHelper } from '@coderline/alphatab/rendering/utils/BeamingHelper';
import { BeatBounds } from '@coderline/alphatab/rendering/utils/BeatBounds';
import { Bounds } from '@coderline/alphatab/rendering/utils/Bounds';

/**
 * @internal
 */
export abstract class BeatContainerGlyphBase extends Glyph {
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
    public abstract registerLayoutingInfo(layoutings: BarLayoutingInfo): void;
    public abstract applyLayoutingInfo(info: BarLayoutingInfo): void;
    public abstract buildBoundingsLookup(barBounds: BarBounds, cx: number, cy: number): void;
    public scaleToWidth(beatWidth: number) {
        this.width = beatWidth;
    }
}

/**
 * @internal
 */
export class BeatContainerGlyph extends BeatContainerGlyphBase {
    private _ties: ITieGlyph[] = [];
    private _tieWidth = 0;
    public beat: Beat;
    public preNotes!: BeatGlyphBase;
    public onNotes!: BeatOnNoteGlyphBase;

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
        this._ties = [];
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
        this._ties.push(tie);
        this.renderer.registerTie(tie);
    }

    public override getBoundingBoxTop(): number {
        return ModelUtils.minBoundingBox(this.preNotes.getBoundingBoxTop(), this.onNotes.getBoundingBoxTop());
    }

    public override getBoundingBoxBottom(): number {
        return ModelUtils.maxBoundingBox(this.preNotes.getBoundingBoxBottom(), this.onNotes.getBoundingBoxBottom());
    }

    protected drawBeamHelperAsFlags(helper: BeamingHelper): boolean {
        return helper.hasFlag(false, undefined);
    }

    protected get postBeatStretch() {
        return (this.onNotes.computedWidth + this._tieWidth) - this.onNotes.onTimeX;
    }

    public registerLayoutingInfo(layoutings: BarLayoutingInfo): void {
        const preBeatStretch: number = this.preNotes.computedWidth + this.onNotes.onTimeX;

        let postBeatStretch: number = this.postBeatStretch;

        for (const tie of this._ties) {
            const tg = tie as unknown as Glyph;
            postBeatStretch += tg.width;
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
        this.onNotes.x = this.preNotes.x + this.preNotes.width;
        this.onNotes.renderer = this.renderer;
        this.onNotes.container = this;
        this.onNotes.doLayout();
        this.createBeatTies();
        this.updateWidth();
    }

    protected createBeatTies() {
        let i: number = this.beat.notes.length - 1;
        while (i >= 0) {
            this.createTies(this.beat.notes[i--]);
        }
    }

    public override doMultiVoiceLayout(): void {
        // do nothing by default, overridden when needed
    }

    protected updateWidth(): void {
        let width = this.preNotes.width + this.onNotes.width;
        let tieWidth: number = 0;
        for (const tie of this._ties) {
            const tg = tie as unknown as Glyph;
            if (tg.width > tieWidth) {
                tieWidth = tg.width;
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

        const isEmptyGlyph: boolean = this.preNotes.isEmpty && this.onNotes.isEmpty && this._ties.length === 0;
        if (isEmptyGlyph) {
            return;
        }
        canvas.beginGroup(BeatContainerGlyph.getGroupId(this.beat));

        this.preNotes.paint(cx + this.x, cy + this.y, canvas);
        this.onNotes.paint(cx + this.x, cy + this.y, canvas);

        // reason: we have possibly multiple staves involved and need to calculate the correct positions.
        const staffX: number = cx - this.renderer.beatGlyphsStart - this.renderer.x;
        const staffY: number = cy - this.renderer.y;
        for (let i: number = 0, j: number = this._ties.length; i < j; i++) {
            const t = this._ties[i] as unknown as Glyph;
            t.renderer = this.renderer;
            t.paint(staffX, staffY, canvas);
        }
        canvas.endGroup();
    }

    public buildBoundingsLookup(barBounds: BarBounds, cx: number, cy: number) {
        const beatBoundings: BeatBounds = new BeatBounds();
        beatBoundings.beat = this.beat;

        if (this.beat.isEmpty) {
            beatBoundings.visualBounds = new Bounds();
            beatBoundings.visualBounds.x = cx + this.x;
            beatBoundings.visualBounds.y = barBounds.visualBounds.y;
            beatBoundings.visualBounds.w = this.width;
            beatBoundings.visualBounds.h = barBounds.visualBounds.h;

            beatBoundings.realBounds = new Bounds();
            beatBoundings.realBounds.x = cx + this.x;
            beatBoundings.realBounds.y = barBounds.realBounds.y;
            beatBoundings.realBounds.w = this.width;
            beatBoundings.realBounds.h = barBounds.realBounds.h;

            beatBoundings.onNotesX = cx + this.x + this.onNotes.x + this.onNotes.onTimeX;
        } else {
            beatBoundings.visualBounds = new Bounds();
            beatBoundings.visualBounds.x = cx + this.x;

            if (!this.preNotes.isEmpty) {
                beatBoundings.visualBounds.x = cx + this.x + this.preNotes.x;
            } else if (!this.onNotes.isEmpty) {
                beatBoundings.visualBounds.x = cx + this.x + this.onNotes.x;
            } else {
                beatBoundings.visualBounds.x = cx + this.x;
            }

            let visualEndX = 0;

            if (!this.onNotes.isEmpty) {
                visualEndX = cx + this.x + this.onNotes.x + this.onNotes.onTimeX + this.postBeatStretch;
            } else if (!this.preNotes.isEmpty) {
                visualEndX = cx + this.x + this.preNotes.x + this.preNotes.width;
            } else {
                visualEndX = cx + this.x + this.width;
            }

            beatBoundings.visualBounds.w = visualEndX - beatBoundings.visualBounds.x;
            beatBoundings.visualBounds.y = barBounds.visualBounds.y;
            beatBoundings.visualBounds.h = barBounds.visualBounds.h;

            beatBoundings.realBounds = new Bounds();
            beatBoundings.realBounds.x = cx + this.x;
            beatBoundings.realBounds.y = barBounds.realBounds.y;
            beatBoundings.realBounds.w = this.width;
            beatBoundings.realBounds.h = barBounds.realBounds.h;

            beatBoundings.onNotesX = cx + this.x + this.onNotes.x + this.onNotes.onTimeX;
        }

        barBounds.addBeat(beatBoundings);

        if (this.renderer.settings.core.includeNoteBounds) {
            this.onNotes.buildBoundingsLookup(beatBoundings, cx + this.x, cy + this.y);
        }
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
