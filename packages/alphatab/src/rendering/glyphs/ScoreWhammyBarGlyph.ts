import { type Beat, BeatSubElement } from '@src/model/Beat';
import type { BendPoint } from '@src/model/BendPoint';
import { BendStyle } from '@src/model/BendStyle';
import { type Note, NoteSubElement } from '@src/model/Note';
import { WhammyType } from '@src/model/WhammyType';
import { NotationMode } from '@src/NotationSettings';
import type { ICanvas, TextAlign } from '@src/platform/ICanvas';
import { BeatXPosition } from '@src/rendering/BeatXPosition';
import { BendNoteHeadGroupGlyph } from '@src/rendering/glyphs/BendNoteHeadGroupGlyph';
import type { ScoreBeatPreNotesGlyph } from '@src/rendering/glyphs/ScoreBeatPreNotesGlyph';
import { ScoreHelperNotesBaseGlyph } from '@src/rendering/glyphs/ScoreHelperNotesBaseGlyph';
import { TieGlyph } from '@src/rendering/glyphs/TieGlyph';
import type { ScoreBarRenderer } from '@src/rendering/ScoreBarRenderer';
import { BeamDirection } from '@src/rendering/utils/BeamDirection';
import type { RenderingResources } from '@src/RenderingResources';
import { NoteHeadGlyph } from '@src/rendering/glyphs/NoteHeadGlyph';
import { NoteYPosition } from '@src/rendering/BarRendererBase';
import { ElementStyleHelper } from '@src/rendering/utils/ElementStyleHelper';
import { MusicFontSymbol } from '@src/model/MusicFontSymbol';

/**
 * @internal
 */
export class ScoreWhammyBarGlyph extends ScoreHelperNotesBaseGlyph {
    private _beat: Beat;
    private _endGlyph: BendNoteHeadGroupGlyph | null = null;

    public constructor(beat: Beat) {
        super(0, 0);
        this._beat = beat;
    }

    public override doLayout(): void {
        const whammyMode: NotationMode = this.renderer.settings.notation.notationMode;
        switch (this._beat.whammyBarType) {
            case WhammyType.None:
            case WhammyType.Custom:
            case WhammyType.Hold:
                return;
            case WhammyType.Dive:
            case WhammyType.PrediveDive:
                {
                    const endGlyphs: BendNoteHeadGroupGlyph = new BendNoteHeadGroupGlyph(this._beat, false);
                    this._endGlyph = endGlyphs;
                    endGlyphs.renderer = this.renderer;
                    const lastWhammyPoint: BendPoint =
                        this._beat.whammyBarPoints![this._beat.whammyBarPoints!.length - 1];
                    for (const note of this._beat.notes) {
                        if (!note.isTieOrigin) {
                            endGlyphs.addGlyph(
                                this._getBendNoteValue(note, lastWhammyPoint),
                                lastWhammyPoint.value % 2 !== 0,
                                undefined
                            );
                        }
                    }
                    endGlyphs.doLayout();
                    this.bendNoteHeads.push(endGlyphs);
                }
                break;
            case WhammyType.Dip:
                {
                    if (whammyMode === NotationMode.SongBook) {
                        const res: RenderingResources = this.renderer.resources;
                        (this.renderer as ScoreBarRenderer).simpleWhammyOverflow =
                            res.tablatureFont.size + this.renderer.smuflMetrics.songBookWhammyDipHeight;
                    } else {
                        const middleGlyphs: BendNoteHeadGroupGlyph = new BendNoteHeadGroupGlyph(this._beat, false);
                        middleGlyphs.renderer = this.renderer;
                        if (this.renderer.settings.notation.notationMode === NotationMode.GuitarPro) {
                            const middleBendPoint: BendPoint = this._beat.whammyBarPoints![1];
                            for (const note of this._beat.notes) {
                                middleGlyphs.addGlyph(
                                    this._getBendNoteValue(note, this._beat.whammyBarPoints![1]),
                                    middleBendPoint.value % 2 !== 0,
                                    undefined
                                );
                            }
                        }
                        middleGlyphs.doLayout();
                        this.bendNoteHeads.push(middleGlyphs);
                        const endGlyphs: BendNoteHeadGroupGlyph = new BendNoteHeadGroupGlyph(this._beat, false);
                        endGlyphs.renderer = this.renderer;
                        this._endGlyph = endGlyphs;

                        if (this.renderer.settings.notation.notationMode === NotationMode.GuitarPro) {
                            const lastBendPoint: BendPoint =
                                this._beat.whammyBarPoints![this._beat.whammyBarPoints!.length - 1];
                            for (const note of this._beat.notes) {
                                endGlyphs.addGlyph(
                                    this._getBendNoteValue(note, lastBendPoint),
                                    lastBendPoint.value % 2 !== 0,
                                    undefined
                                );
                            }
                        }
                        endGlyphs.doLayout();
                        this.bendNoteHeads.push(endGlyphs);
                    }
                }
                break;
            case WhammyType.Predive:
                break;
        }
        super.doLayout();
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        const beat: Beat = this._beat;
        switch (beat.whammyBarType) {
            case WhammyType.None:
            case WhammyType.Custom:
                return;
        }
        const whammyMode: NotationMode = this.renderer.settings.notation.notationMode;
        const startNoteRenderer: ScoreBarRenderer = this.renderer.scoreRenderer.layout!.getRendererForBar(
            this.renderer.staff.staffId,
            beat.voice.bar
        )! as ScoreBarRenderer;

        using _beatStyle = ElementStyleHelper.beat(canvas, BeatSubElement.StandardNotationEffects, beat);

        const startX: number = cx + startNoteRenderer.x + startNoteRenderer.getBeatX(beat, BeatXPosition.MiddleNotes);
        const beatDirection: BeamDirection = this.getTieDirection(beat, startNoteRenderer);
        let direction: BeamDirection = this._beat.notes.length === 1 ? beatDirection : BeamDirection.Up;
        const textalign: TextAlign = canvas.textAlign;
        const noteHeadHeight = this.renderer.smuflMetrics.glyphHeights.get(MusicFontSymbol.NoteheadBlack)!;

        for (let i: number = 0; i < beat.notes.length; i++) {
            const note: Note = beat.notes[i];
            using _noteStyle = ElementStyleHelper.note(canvas, NoteSubElement.StandardNotationEffects, note);

            let startY: number = cy + startNoteRenderer.y;
            if (i > 0 && i >= ((this._beat.notes.length / 2) | 0)) {
                direction = BeamDirection.Down;
            }

            if (direction === BeamDirection.Down) {
                startY += startNoteRenderer.getNoteY(note, NoteYPosition.Bottom);
            } else {
                startY += startNoteRenderer.getNoteY(note, NoteYPosition.Top);
            }

            let endX: number = cx + startNoteRenderer.x;
            if (beat.isLastOfVoice) {
                endX += startNoteRenderer.postBeatGlyphsStart;
            } else {
                endX += startNoteRenderer.getBeatX(beat, BeatXPosition.EndBeat);
            }

            if (this._endGlyph) {
                endX -= this._endGlyph.upLineX;
            }

            const slurText: string = beat.whammyStyle === BendStyle.Gradual && i === 0 ? 'grad.' : '';
            let endNoteRenderer: ScoreBarRenderer | null = null;
            if (note.isTieOrigin) {
                endNoteRenderer = this.renderer.scoreRenderer.layout!.getRendererForBar(
                    this.renderer.staff.staffId,
                    note.tieDestination!.beat.voice.bar
                ) as ScoreBarRenderer | null;
                if (endNoteRenderer && endNoteRenderer.staff === startNoteRenderer.staff) {
                    endX =
                        cx +
                        endNoteRenderer.x +
                        endNoteRenderer.getBeatX(note.tieDestination!.beat, BeatXPosition.MiddleNotes);
                } else {
                    endNoteRenderer = null;
                }
            }

            let heightOffset: number = noteHeadHeight * NoteHeadGlyph.GraceScale * 0.5;
            if (direction === BeamDirection.Up) {
                heightOffset = -heightOffset;
            }
            const endValue: number =
                beat.whammyBarPoints!.length > 0
                    ? this._getBendNoteValue(note, beat.whammyBarPoints![beat.whammyBarPoints!.length - 1])
                    : 0;
            let endY: number = 0;
            let bendTie: boolean = false;

            if (this.bendNoteHeads.length > 0 && this.bendNoteHeads[0].containsNoteValue(endValue)) {
                endY = this.bendNoteHeads[0].getNoteValueY(endValue) + heightOffset;
                bendTie = true;
            } else if (
                endNoteRenderer &&
                ((note.isTieOrigin && note.tieDestination!.beat.hasWhammyBar) || note.beat.isContinuedWhammy)
            ) {
                endY = cy + endNoteRenderer.y + endNoteRenderer.getNoteY(note.tieDestination!, NoteYPosition.Top);
                bendTie = true;
                if (direction === BeamDirection.Down) {
                    endY += noteHeadHeight;
                }
            } else if (note.isTieOrigin) {
                if (!endNoteRenderer) {
                    endY = startY;
                } else {
                    endY = cy + endNoteRenderer.y + endNoteRenderer.getNoteY(note.tieDestination!, NoteYPosition.Top);
                }
                if (direction === BeamDirection.Down) {
                    endY += noteHeadHeight;
                }
            }

            switch (beat.whammyBarType) {
                case WhammyType.Hold:
                    if (note.isTieOrigin) {
                        TieGlyph.paintTie(
                            canvas,
                            1,
                            startX,
                            startY,
                            endX,
                            endY,
                            beatDirection === BeamDirection.Down,
                            this.renderer.smuflMetrics.tieHeight,
                            this.renderer.smuflMetrics.slurMidpointThickness
                        );
                    }
                    break;
                case WhammyType.Dive:
                    if (i === 0) {
                        this.bendNoteHeads[0].x = endX - this.bendNoteHeads[0].noteHeadOffset;
                        const previousY = this.bendNoteHeads[0].y;
                        this.bendNoteHeads[0].y = cy + startNoteRenderer.y;
                        this.bendNoteHeads[0].paint(0, 0, canvas);
                        if (this.bendNoteHeads[0].containsNoteValue(endValue)) {
                            endY -= previousY;
                            endY += this.bendNoteHeads[0].y;
                        }
                    }
                    if (bendTie) {
                        this.drawBendSlur(
                            canvas,
                            startX,
                            startY,
                            endX,
                            endY,
                            direction === BeamDirection.Down,
                            1,
                            slurText
                        );
                    } else if (note.isTieOrigin) {
                        TieGlyph.paintTie(
                            canvas,
                            1,
                            startX,
                            startY,
                            endX,
                            endY,
                            beatDirection === BeamDirection.Down,
                            this.renderer.smuflMetrics.tieHeight,
                            this.renderer.smuflMetrics.slurMidpointThickness
                        );
                    }
                    break;
                case WhammyType.Dip:
                    if (whammyMode === NotationMode.SongBook) {
                        if (i === 0) {
                            const simpleStartX: number =
                                cx +
                                startNoteRenderer.x +
                                startNoteRenderer.getBeatX(this._beat, BeatXPosition.OnNotes);
                            const simpleEndX: number =
                                cx +
                                startNoteRenderer.x +
                                startNoteRenderer.getBeatX(this._beat, BeatXPosition.PostNotes);
                            const middleX: number = (simpleStartX + simpleEndX) / 2;
                            const text: string = (
                                ((this._beat.whammyBarPoints![1].value - this._beat.whammyBarPoints![0].value) / 4) |
                                0
                            ).toString();
                            canvas.font = this.renderer.resources.tablatureFont;
                            canvas.fillText(text, middleX, cy + this.y);
                            const simpleStartY: number = cy + this.y + canvas.font.size;
                            const simpleEndY: number =
                                simpleStartY + this.renderer.smuflMetrics.songBookWhammyDipHeight;
                            if (this._beat.whammyBarPoints![1].value > this._beat.whammyBarPoints![0].value) {
                                canvas.moveTo(simpleStartX, simpleEndY);
                                canvas.lineTo(middleX, simpleStartY);
                                canvas.lineTo(simpleEndX, simpleEndY);
                            } else {
                                canvas.moveTo(simpleStartX, simpleStartY);
                                canvas.lineTo(middleX, simpleEndY);
                                canvas.lineTo(simpleEndX, simpleStartY);
                            }
                            canvas.stroke();
                        }
                        if (note.isTieOrigin) {
                            TieGlyph.paintTie(
                                canvas,
                                1,
                                startX,
                                startY,
                                endX,
                                endY,
                                beatDirection === BeamDirection.Down,
                                this.renderer.smuflMetrics.tieHeight,
                                this.renderer.smuflMetrics.slurMidpointThickness
                            );
                        }
                    } else {
                        const middleX: number = (startX + endX) / 2;
                        this.bendNoteHeads[0].x = middleX - this.bendNoteHeads[0].noteHeadOffset;
                        this.bendNoteHeads[0].y = cy + startNoteRenderer.y;
                        this.bendNoteHeads[0].paint(0, 0, canvas);
                        const middleValue: number = this._getBendNoteValue(note, beat.whammyBarPoints![1]);
                        const middleY: number = this.bendNoteHeads[0].getNoteValueY(middleValue) + heightOffset;
                        this.drawBendSlur(
                            canvas,
                            startX,
                            startY,
                            middleX,
                            middleY,
                            direction === BeamDirection.Down,
                            1,
                            slurText
                        );
                        this.bendNoteHeads[1].x = endX - this.bendNoteHeads[1].noteHeadOffset;
                        this.bendNoteHeads[1].y = cy + startNoteRenderer.y;
                        this.bendNoteHeads[1].paint(0, 0, canvas);
                        endY = this.bendNoteHeads[1].getNoteValueY(endValue) + heightOffset;
                        this.drawBendSlur(
                            canvas,
                            middleX,
                            middleY,
                            endX,
                            endY,
                            direction === BeamDirection.Down,
                            1,
                            slurText
                        );
                    }
                    break;
                case WhammyType.PrediveDive:
                case WhammyType.Predive:
                    let preX: number =
                        cx + startNoteRenderer.x + startNoteRenderer.getBeatX(note.beat, BeatXPosition.PreNotes);
                    preX += (startNoteRenderer.getPreNotesGlyphForBeat(note.beat) as ScoreBeatPreNotesGlyph)
                        .prebendNoteHeadOffset;
                    const preY: number =
                        cy +
                        startNoteRenderer.y +
                        startNoteRenderer.getScoreY(
                            startNoteRenderer.accidentalHelper.getNoteLineForValue(
                                note.displayValue - ((note.beat.whammyBarPoints![0].value / 2) | 0),
                                false
                            )
                        ) +
                        heightOffset;
                    this.drawBendSlur(
                        canvas,
                        preX,
                        preY,
                        startX,
                        startY,
                        direction === BeamDirection.Down,
                        1,
                        slurText
                    );
                    if (this.bendNoteHeads.length > 0) {
                        this.bendNoteHeads[0].x = endX - this.bendNoteHeads[0].noteHeadOffset;
                        this.bendNoteHeads[0].y = cy + startNoteRenderer.y;
                        this.bendNoteHeads[0].paint(0, 0, canvas);
                        this.drawBendSlur(
                            canvas,
                            startX,
                            startY,
                            endX,
                            endY,
                            direction === BeamDirection.Down,
                            1,
                            slurText
                        );
                    }
                    break;
            }
        }
        canvas.textAlign = textalign;
    }

    private _getBendNoteValue(note: Note, bendPoint: BendPoint): number {
        // NOTE: bendpoints are in 1/4 tones, but the note values are in 1/2 notes.
        return note.displayValueWithoutBend + ((bendPoint.value / 2) | 0);
    }
}
