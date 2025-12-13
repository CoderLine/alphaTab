import { EngravingSettings } from '@coderline/alphatab/EngravingSettings';
import { type Beat, BeatSubElement } from '@coderline/alphatab/model/Beat';
import type { BendPoint } from '@coderline/alphatab/model/BendPoint';
import { BendStyle } from '@coderline/alphatab/model/BendStyle';
import { MusicFontSymbol } from '@coderline/alphatab/model/MusicFontSymbol';
import { type Note, NoteSubElement } from '@coderline/alphatab/model/Note';
import { WhammyType } from '@coderline/alphatab/model/WhammyType';
import { NotationMode } from '@coderline/alphatab/NotationSettings';
import type { ICanvas, TextAlign } from '@coderline/alphatab/platform/ICanvas';
import { NoteYPosition } from '@coderline/alphatab/rendering/BarRendererBase';
import { BeatXPosition } from '@coderline/alphatab/rendering/BeatXPosition';
import { BendNoteHeadGroupGlyph } from '@coderline/alphatab/rendering/glyphs/BendNoteHeadGroupGlyph';
import { ScoreHelperNotesBaseGlyph } from '@coderline/alphatab/rendering/glyphs/ScoreHelperNotesBaseGlyph';
import { type ITieGlyph, TieGlyph } from '@coderline/alphatab/rendering/glyphs/TieGlyph';
import type { ScoreBarRenderer } from '@coderline/alphatab/rendering/ScoreBarRenderer';
import type { ScoreBeatContainerGlyph } from '@coderline/alphatab/rendering/ScoreBeatContainerGlyph';
import { BeamDirection } from '@coderline/alphatab/rendering/utils/BeamDirection';
import { ElementStyleHelper } from '@coderline/alphatab/rendering/utils/ElementStyleHelper';

/**
 * @internal
 */
export class ScoreWhammyBarGlyph extends ScoreHelperNotesBaseGlyph implements ITieGlyph {
    private _container: ScoreBeatContainerGlyph;
    private _beat: Beat;
    private _endGlyph: BendNoteHeadGroupGlyph | null = null;

    public readonly checkForOverflow = false;

    public constructor(container: ScoreBeatContainerGlyph) {
        super(0, 0);
        this._container = container;
        this._beat = container.beat;
    }

    public get hasBoundingBox(): boolean {
        const endGlyph = this._endGlyph;
        if (!endGlyph) {
            return false;
        }
        return !!endGlyph.minNote && !!endGlyph.maxNote;
    }

    public override getBoundingBoxTop(): number {
        if (this._endGlyph?.minNote) {
            return this._endGlyph.minNote.glyph.getBoundingBoxTop();
        }
        return super.getBoundingBoxTop();
    }

    public override getBoundingBoxBottom(): number {
        if (this._endGlyph?.maxNote) {
            return this._endGlyph.maxNote.glyph.getBoundingBoxBottom();
        }
        return super.getBoundingBoxBottom();
    }

    public override doLayout(): void {
        const sr = this.renderer as ScoreBarRenderer;
        const whammyMode: NotationMode = sr.settings.notation.notationMode;
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
                    endGlyphs.renderer = sr;
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
                    this.addGlyph(endGlyphs);
                }
                break;
            case WhammyType.Dip:
                {
                    if (whammyMode === NotationMode.SongBook) {
                        // handled separately
                        return;
                    } else {
                        const middleGlyphs: BendNoteHeadGroupGlyph = new BendNoteHeadGroupGlyph(this._beat, false);
                        middleGlyphs.renderer = sr;
                        if (sr.settings.notation.notationMode === NotationMode.GuitarPro) {
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
                        this.addGlyph(middleGlyphs);
                        const endGlyphs: BendNoteHeadGroupGlyph = new BendNoteHeadGroupGlyph(this._beat, false);
                        endGlyphs.renderer = sr;
                        this._endGlyph = endGlyphs;

                        if (sr.settings.notation.notationMode === NotationMode.GuitarPro) {
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
                        this.addGlyph(endGlyphs);
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
            this.renderer.staff!.staffId,
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
                    this.renderer.staff!.staffId,
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

            let heightOffset: number = noteHeadHeight * EngravingSettings.GraceScale * 0.5;
            if (direction === BeamDirection.Up) {
                heightOffset = -heightOffset;
            }
            const endValue: number =
                beat.whammyBarPoints!.length > 0
                    ? this._getBendNoteValue(note, beat.whammyBarPoints![beat.whammyBarPoints!.length - 1])
                    : 0;
            let endY: number = 0;
            let bendTie: boolean = false;

            if (this.glyphs && (this.glyphs![0] as BendNoteHeadGroupGlyph).containsNoteValue(endValue)) {
                endY = (this.glyphs[0] as BendNoteHeadGroupGlyph).getNoteValueY(endValue) + heightOffset;
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
                        const g0 = this.glyphs![0] as BendNoteHeadGroupGlyph;
                        g0.x = endX - g0.noteHeadOffset;
                        const previousY = this.glyphs![0].y;
                        g0.y = cy + startNoteRenderer.y;
                        g0.paint(0, 0, canvas);
                        if (g0.containsNoteValue(endValue)) {
                            endY -= previousY;
                            endY += g0.y;
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
                        const g0 = this.glyphs![0] as BendNoteHeadGroupGlyph;
                        g0.x = middleX - g0.noteHeadOffset;
                        g0.y = cy + startNoteRenderer.y;
                        g0.paint(0, 0, canvas);
                        const middleValue: number = this._getBendNoteValue(note, beat.whammyBarPoints![1]);
                        const middleY: number = g0.getNoteValueY(middleValue) + heightOffset;
                        this.drawBendSlur(
                            canvas,
                            startX,
                            startY,
                            middleX,
                            middleY,
                            direction === BeamDirection.Down,
                            slurText
                        );

                        const g1 = this.glyphs![1] as BendNoteHeadGroupGlyph;
                        g1.x = endX - g1.noteHeadOffset;
                        g1.y = cy + startNoteRenderer.y;
                        g1.paint(0, 0, canvas);
                        endY = g1.getNoteValueY(endValue) + heightOffset;
                        this.drawBendSlur(
                            canvas,
                            middleX,
                            middleY,
                            endX,
                            endY,
                            direction === BeamDirection.Down,
                            slurText
                        );
                    }
                    break;
                case WhammyType.PrediveDive:
                case WhammyType.Predive:
                    let preX: number =
                        cx + startNoteRenderer.x + startNoteRenderer.getBeatX(note.beat, BeatXPosition.PreNotes);
                    preX += this._container.prebendNoteHeadOffset;
                    const preY: number =
                        cy +
                        startNoteRenderer.y +
                        startNoteRenderer.getScoreY(
                            startNoteRenderer.accidentalHelper.getNoteStepsForValue(
                                note.displayValue - ((note.beat.whammyBarPoints![0].value / 2) | 0),
                                false
                            )
                        ) +
                        heightOffset;
                    this.drawBendSlur(canvas, preX, preY, startX, startY, direction === BeamDirection.Down, slurText);
                    if (this.glyphs) {
                        const g0 = this.glyphs![0] as BendNoteHeadGroupGlyph;
                        g0.x = endX - g0.noteHeadOffset;
                        g0.y = cy + startNoteRenderer.y;
                        g0.paint(0, 0, canvas);
                        this.drawBendSlur(
                            canvas,
                            startX,
                            startY,
                            endX,
                            endY,
                            direction === BeamDirection.Down,
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
