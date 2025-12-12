import type { Beat } from '@coderline/alphatab/model/Beat';
import { GraceType } from '@coderline/alphatab/model/GraceType';
import { ModelUtils } from '@coderline/alphatab/model/ModelUtils';
import { MusicFontSymbol } from '@coderline/alphatab/model/MusicFontSymbol';
import type { Note } from '@coderline/alphatab/model/Note';
import type { ICanvas } from '@coderline/alphatab/platform/ICanvas';
import { BeatXPosition } from '@coderline/alphatab/rendering/BeatXPosition';
import type { BeatGlyphBase } from '@coderline/alphatab/rendering/glyphs/BeatGlyphBase';
import type { BeatOnNoteGlyphBase } from '@coderline/alphatab/rendering/glyphs/BeatOnNoteGlyphBase';
import { Glyph } from '@coderline/alphatab/rendering/glyphs/Glyph';
import { NoteHeadGlyph } from '@coderline/alphatab/rendering/glyphs/NoteHeadGlyph';
import type { ITieGlyph } from '@coderline/alphatab/rendering/glyphs/TieGlyph';
import type { VoiceContainerGlyph } from '@coderline/alphatab/rendering/glyphs/VoiceContainerGlyph';
import type { BarLayoutingInfo } from '@coderline/alphatab/rendering/staves/BarLayoutingInfo';
import type { BarBounds } from '@coderline/alphatab/rendering/utils/BarBounds';
import type { BeamingHelper } from '@coderline/alphatab/rendering/utils/BeamingHelper';
import { BeatBounds } from '@coderline/alphatab/rendering/utils/BeatBounds';
import { Bounds } from '@coderline/alphatab/rendering/utils/Bounds';

/**
 * @internal
 */
export class BeatContainerGlyph extends Glyph {
    private _ties: ITieGlyph[] = [];
    public voiceContainer: VoiceContainerGlyph;
    public beat: Beat;
    public preNotes!: BeatGlyphBase;
    public onNotes!: BeatOnNoteGlyphBase;
    public minWidth: number = 0;

    public get onTimeX(): number {
        return this.onNotes.x + this.onNotes.onTimeX;
    }

    public constructor(beat: Beat, voiceContainer: VoiceContainerGlyph) {
        super(0, 0);
        this.beat = beat;
        this._ties = [];
        this.voiceContainer = voiceContainer;
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

    public registerLayoutingInfo(layoutings: BarLayoutingInfo): void {
        const preBeatStretch: number = this.preNotes.computedWidth + this.onNotes.onTimeX;

        let postBeatStretch: number = this.onNotes.computedWidth - this.onNotes.onTimeX;
        // make space for flag
        const helper = this.renderer.helpers.getBeamingHelperForBeat(this.beat);
        if (this.beat.graceType !== GraceType.None) {
            // always use flag size as spacing on grace notes
            postBeatStretch +=
                this.renderer.smuflMetrics.glyphWidths.get(MusicFontSymbol.Flag8thUp)! * NoteHeadGlyph.GraceScale;
        } else if (helper && this.drawBeamHelperAsFlags(helper)) {
            postBeatStretch +=
                this.renderer.smuflMetrics.glyphWidths.get(MusicFontSymbol.Flag8thUp)! * NoteHeadGlyph.GraceScale;
        }
        for (const tie of this._ties) {
            const tg = tie as unknown as Glyph;
            postBeatStretch += tg.width;
        }

        layoutings.addBeatSpring(this.beat, preBeatStretch, postBeatStretch);

        // store sizes for usages in effects
        // we might have empty content in the individual bar renderers, but need to know
        // the "shared" maximum widths
        layoutings.setBeatSizes(this.beat, {
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
        let i: number = this.beat.notes.length - 1;
        while (i >= 0) {
            this.createTies(this.beat.notes[i--]);
        }
        this.updateWidth();
    }

    protected updateWidth(): void {
        this.minWidth = this.preNotes.width + this.onNotes.width;
        let tieWidth: number = 0;
        for (const tie of this._ties) {
            const tg = tie as unknown as Glyph;
            if (tg.width > tieWidth) {
                tieWidth = tg.width;
            }
        }
        this.minWidth += tieWidth;
        this.width = this.minWidth;
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

        //     canvas.color = new Color(0, 200, 0, 100);
        //     canvas.strokeRect(cx + this.x + this.onNotes.x, cy + this.y + 10, this.onNotes.width, 10);

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
        const staffX: number = cx - this.voiceContainer.x - this.renderer.x;
        const staffY: number = cy - this.voiceContainer.y - this.renderer.y;
        for (let i: number = 0, j: number = this._ties.length; i < j; i++) {
            const t = this._ties[i] as unknown as Glyph;
            t.renderer = this.renderer;
            t.paint(staffX, staffY, canvas);
        }
        canvas.endGroup();
    }

    public buildBoundingsLookup(barBounds: BarBounds, cx: number, cy: number, _isEmptyBar: boolean) {
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
                visualEndX = cx + this.x + this.onNotes.x + this.onNotes.width;
            } else if (!this.preNotes.isEmpty) {
                visualEndX = cx + this.x + this.preNotes.x + this.preNotes.width;
            } else {
                visualEndX = cx + this.x + this.width;
            }

            beatBoundings.visualBounds.w = visualEndX - beatBoundings.visualBounds.x;
            const helper = this.renderer.helpers.getBeamingHelperForBeat(this.beat);
            if ((helper && this.drawBeamHelperAsFlags(helper)) || this.beat.graceType !== GraceType.None) {
                beatBoundings.visualBounds.w +=
                    this.renderer.smuflMetrics.glyphWidths.get(MusicFontSymbol.Flag8thUp)! *
                    (this.beat.graceType !== GraceType.None ? NoteHeadGlyph.GraceScale : 1);
            }

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
    }
}
