import { EngravingSettings } from '@coderline/alphatab/EngravingSettings';
import { BeatSubElement } from '@coderline/alphatab/model/Beat';
import { Duration } from '@coderline/alphatab/model/Duration';
import { GraceType } from '@coderline/alphatab/model/GraceType';
import { MusicFontSymbol } from '@coderline/alphatab/model/MusicFontSymbol';
import type { Note } from '@coderline/alphatab/model/Note';
import type { ICanvas } from '@coderline/alphatab/platform/ICanvas';
import { NoteXPosition, NoteYPosition } from '@coderline/alphatab/rendering/BarRendererBase';
import { AugmentationDotGlyph } from '@coderline/alphatab/rendering/glyphs/AugmentationDotGlyph';
import { BeatOnNoteGlyphBase } from '@coderline/alphatab/rendering/glyphs/BeatOnNoteGlyphBase';
import { DeadSlappedBeatGlyph } from '@coderline/alphatab/rendering/glyphs/DeadSlappedBeatGlyph';
import type { Glyph } from '@coderline/alphatab/rendering/glyphs/Glyph';
import { SlashNoteHeadGlyph } from '@coderline/alphatab/rendering/glyphs/SlashNoteHeadGlyph';
import { SlashRestGlyph } from '@coderline/alphatab/rendering/glyphs/SlashRestGlyph';
import { TremoloPickingGlyph } from '@coderline/alphatab/rendering/glyphs/TremoloPickingGlyph';
import type { SlashBarRenderer } from '@coderline/alphatab/rendering/SlashBarRenderer';
import type { BeatBounds } from '@coderline/alphatab/rendering/utils/BeatBounds';
import { Bounds } from '@coderline/alphatab/rendering/utils/Bounds';
import { NoteBounds } from '@coderline/alphatab/rendering/utils/NoteBounds';

/**
 * @internal
 */
export class SlashBeatGlyph extends BeatOnNoteGlyphBase {
    private _tremoloPicking?: TremoloPickingGlyph;

    public noteHeads: SlashNoteHeadGlyph | null = null;
    public deadSlapped: DeadSlappedBeatGlyph | null = null;
    public restGlyph: SlashRestGlyph | null = null;

    protected override get effectElement() {
        return BeatSubElement.SlashEffects;
    }

    public override getNoteX(_note: Note, requestedPosition: NoteXPosition): number {
        let g: Glyph | null = null;
        if (this.noteHeads) {
            g = this.noteHeads;
        } else if (this.deadSlapped) {
            g = this.deadSlapped;
        }

        if (g) {
            let pos = g.x;
            switch (requestedPosition) {
                case NoteXPosition.Left:
                    break;
                case NoteXPosition.Center:
                    pos += g.width / 2;
                    break;
                case NoteXPosition.Right:
                    pos += g.width;
                    break;
            }
            return pos;
        }

        return 0;
    }

    public override buildBoundingsLookup(beatBounds: BeatBounds, cx: number, cy: number) {
        if (this.noteHeads && this.container.beat.notes.length > 0) {
            const noteBounds = new NoteBounds();
            noteBounds.note = this.container.beat.notes[0];
            noteBounds.noteHeadBounds = new Bounds();
            noteBounds.noteHeadBounds.x = cx + this.x + this.noteHeads.x;
            noteBounds.noteHeadBounds.y = cy + this.y + this.noteHeads.y - this.noteHeads.height / 2;
            noteBounds.noteHeadBounds.w = this.width;
            noteBounds.noteHeadBounds.h = this.height;
            beatBounds.addNote(noteBounds);
        }
    }

    public override getLowestNoteY(requestedPosition: NoteYPosition): number {
        return this._internalGetNoteY(requestedPosition);
    }

    public override getHighestNoteY(requestedPosition: NoteYPosition): number {
        return this._internalGetNoteY(requestedPosition);
    }

    public override getRestY(requestedPosition: NoteYPosition): number {
        const g = this.restGlyph;
        if (g) {
            switch (requestedPosition) {
                case NoteYPosition.TopWithStem:
                case NoteYPosition.Top:
                    return g.getBoundingBoxTop();
                case NoteYPosition.Center:
                case NoteYPosition.StemUp:
                case NoteYPosition.StemDown:
                    return g.getBoundingBoxTop() + g.height / 2;
                case NoteYPosition.Bottom:
                case NoteYPosition.BottomWithStem:
                    return g.getBoundingBoxBottom();
            }
        }
        return 0;
    }

    public override getNoteY(_note: Note, requestedPosition: NoteYPosition): number {
        return this._internalGetNoteY(requestedPosition);
    }

    public _internalGetNoteY(requestedPosition: NoteYPosition): number {
        let g: Glyph | null = null;
        let symbol: MusicFontSymbol = MusicFontSymbol.None;
        let hasStem = false;
        if (this.noteHeads) {
            g = this.noteHeads;
            symbol = SlashNoteHeadGlyph.getSymbol(this.container.beat.duration);
            hasStem = true;
        } else if (this.deadSlapped) {
            g = this.deadSlapped;
        }

        if (g) {
            let pos = this.y + g.y;
            const scale = this.container.beat.graceType !== GraceType.None ? EngravingSettings.GraceScale : 1;

            switch (requestedPosition) {
                case NoteYPosition.TopWithStem:
                    if (hasStem) {
                        // stem start
                        pos -=
                            (this.renderer.smuflMetrics.stemUp.has(symbol)
                                ? this.renderer.smuflMetrics.stemUp.get(symbol)!.bottomY
                                : 0) * scale;

                        // stem size according to duration
                        pos -= this.renderer.smuflMetrics.standardStemLength * scale;
                    } else {
                        pos -= g.height / 2;
                    }
                    return pos;
                case NoteYPosition.Top:
                    pos -= g.height / 2;
                    break;
                case NoteYPosition.Center:
                    break;
                case NoteYPosition.Bottom:
                    pos += g.height / 2;
                    break;
                case NoteYPosition.BottomWithStem:
                    if (hasStem) {
                        pos -=
                            (this.renderer.smuflMetrics.stemDown.has(symbol)
                                ? this.renderer.smuflMetrics.stemDown.get(symbol)!.topY
                                : -this.renderer.smuflMetrics.glyphHeights.get(symbol)! / 2) * scale;

                        // stem size according to duration
                        pos += this.renderer.smuflMetrics.standardStemLength * scale;
                    } else {
                        pos += g.height / 2;
                    }
                    return pos;

                case NoteYPosition.StemUp:
                    pos -= this.renderer.smuflMetrics.stemUp.has(symbol)
                        ? this.renderer.smuflMetrics.stemUp.get(symbol)!.bottomY
                        : 0;
                    break;
                case NoteYPosition.StemDown:
                    pos -= this.renderer.smuflMetrics.stemDown.has(symbol)
                        ? this.renderer.smuflMetrics.stemDown.get(symbol)!.topY
                        : 0;
                    break;
            }

            return pos;
        }
        return 0;
    }

    public override doLayout(): void {
        // create glyphs
        const sr = this.renderer as SlashBarRenderer;

        const glyphY = sr.getLineY(0);
        if (this.container.beat.deadSlapped) {
            const deadSlapped = new DeadSlappedBeatGlyph();
            deadSlapped.renderer = this.renderer;
            deadSlapped.doLayout();
            this.deadSlapped = deadSlapped;
            this.addEffect(deadSlapped);
        } else if (!this.container.beat.isEmpty) {
            if (!this.container.beat.isRest) {
                const noteHeadGlyph = new SlashNoteHeadGlyph(0, glyphY, this.container.beat);
                this.noteHeads = noteHeadGlyph;
                noteHeadGlyph.beat = this.container.beat;
                this.addNormal(noteHeadGlyph);

                if (this.container.beat.isTremolo) {
                    let tremoloY = 0;
                    const topY = this._internalGetNoteY(NoteYPosition.TopWithStem);
                    const bottomY = this._internalGetNoteY(NoteYPosition.StemUp);
                    tremoloY = (topY + bottomY) / 2;

                    this._tremoloPicking = new TremoloPickingGlyph(0, tremoloY, this.container.beat.duration!);
                    this._tremoloPicking.renderer = this.renderer;
                    this._tremoloPicking.doLayout();
                }
            } else {
                const restGlyph = new SlashRestGlyph(0, glyphY, this.container.beat.duration);
                this.restGlyph = restGlyph;
                restGlyph.beat = this.container.beat;
                this.addNormal(restGlyph);
            }
        }

        //
        // Note dots
        //
        if (this.container.beat.dots > 0) {
            for (let i: number = 0; i < this.container.beat.dots; i++) {
                this.addEffect(new AugmentationDotGlyph(0, glyphY - sr.getLineHeight(0.5)));
            }
        }

        super.doLayout();

        if (this.container.beat.isEmpty) {
            this.onTimeX = this.width / 2;
            this.stemX = this.onTimeX;
        } else if (this.restGlyph) {
            this.onTimeX = this.restGlyph.x + this.restGlyph.width / 2;
            this.stemX = this.onTimeX;
        } else if (this.noteHeads) {
            this.onTimeX = this.noteHeads.x + this.noteHeads.width / 2;
            this.stemX = this.noteHeads!.x + this.noteHeads!.stemX;
        } else if (this.deadSlapped) {
            this.onTimeX = this.deadSlapped.x + this.deadSlapped.width / 2;
            this.stemX = this.onTimeX;
        }
        this.middleX = this.onTimeX;

        const tremolo = this._tremoloPicking;
        if (tremolo) {
            tremolo.x = this.container.beat.duration < Duration.Half ? this.width / 2 : this.stemX;
        }
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        super.paint(cx, cy, canvas);
        const tremolo = this._tremoloPicking;
        if (tremolo) {
            tremolo.paint(cx + this.x, cy + this.y, canvas);
        }
    }
}
