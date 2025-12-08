import type { Beat } from '@coderline/alphatab/model/Beat';
import type { BendPoint } from '@coderline/alphatab/model/BendPoint';
import { BendStyle } from '@coderline/alphatab/model/BendStyle';
import { BendType } from '@coderline/alphatab/model/BendType';
import { GraceType } from '@coderline/alphatab/model/GraceType';
import { MusicFontSymbol } from '@coderline/alphatab/model/MusicFontSymbol';
import { type Note, NoteSubElement } from '@coderline/alphatab/model/Note';
import type { ICanvas } from '@coderline/alphatab/platform/ICanvas';
import { NoteYPosition } from '@coderline/alphatab/rendering/BarRendererBase';
import { BeatXPosition } from '@coderline/alphatab/rendering/BeatXPosition';
import { BendNoteHeadGroupGlyph } from '@coderline/alphatab/rendering/glyphs/BendNoteHeadGroupGlyph';
import { NoteHeadGlyph } from '@coderline/alphatab/rendering/glyphs/NoteHeadGlyph';
import type { ScoreBeatPreNotesGlyph } from '@coderline/alphatab/rendering/glyphs/ScoreBeatPreNotesGlyph';
import { ScoreHelperNotesBaseGlyph } from '@coderline/alphatab/rendering/glyphs/ScoreHelperNotesBaseGlyph';
import { type ITieGlyph, TieGlyph } from '@coderline/alphatab/rendering/glyphs/TieGlyph';
import type { ScoreBarRenderer } from '@coderline/alphatab/rendering/ScoreBarRenderer';
import { BeamDirection } from '@coderline/alphatab/rendering/utils/BeamDirection';
import { ElementStyleHelper } from '@coderline/alphatab/rendering/utils/ElementStyleHelper';

/**
 * @internal
 */
export class ScoreBendGlyph extends ScoreHelperNotesBaseGlyph implements ITieGlyph {
    private _beat: Beat;
    private _notes: Note[] = [];
    private _endNoteGlyph: BendNoteHeadGroupGlyph | null = null;
    private _middleNoteGlyph: BendNoteHeadGroupGlyph | null = null;

    public readonly checkForOverflow = false; // handled separately in ScoreBeatContainerGlyph

    public constructor(beat: Beat) {
        super(0, 0);
        this._beat = beat;
    }

    public override getBoundingBoxTop(): number {
        return super.getBoundingBoxTop() - this._calculateMaxSlurHeight(BeamDirection.Up);
    }

    public override getBoundingBoxBottom(): number {
        return super.getBoundingBoxBottom() + this._calculateMaxSlurHeight(BeamDirection.Down);
    }

    private _calculateMaxSlurHeight(expectedDirection: BeamDirection) {
        const direction = this.getTieDirection(this._beat, this.renderer as ScoreBarRenderer);
        if (direction !== expectedDirection) {
            return 0;
        }

        let maxSlurHeight = 0;

        // this logic is similar to the actual drawing but more lightweight,
        // until we rework how we handle ties this is a good estimate
        for (const note of this._notes) {
            if (note.isTieOrigin) {
                continue;
            }

            // no helper notes created in addbends for these:
            switch(note.bendType){
                case BendType.Custom:
                case BendType.Prebend:
                case BendType.Hold:
                    continue;
            }

            // at this point in time the beats have not been timely-positioned yet,
            // hence we cannot rely on their actual position, we can only estimate the size here
            const parent = this.renderer.getBeatContainer(this._beat)!;
            const width: number = parent.width * 2;

            let endY: number = 0;
            let endX: number = 0;
            switch (note.bendType) {
                case BendType.Bend:
                case BendType.PrebendBend:
                    endY = this._endNoteGlyph!.minNote!.glyph.getBoundingBoxTop();
                    endX = width;
                    break;
                case BendType.BendRelease:
                    endY = this._middleNoteGlyph!.minNote!.glyph.getBoundingBoxTop();
                    endX = width / 2;
                    break;
                case BendType.Release:
                case BendType.PrebendRelease:
                    endY = this._endNoteGlyph!.maxNote!.glyph.getBoundingBoxTop();
                    endX = width;
                    break;
            }
            const startY = this.renderer.getNoteY(note, NoteYPosition.Top);
            let slurHeight = Math.abs(
                TieGlyph.calculateBendSlurTopY(
                    0,
                    startY,
                    endX,
                    endY,
                    direction === BeamDirection.Down,
                    1,
                    this.renderer.smuflMetrics.tieHeight
                ) - endY
            );

            if (note.bendStyle === BendStyle.Gradual) {
                const res = this.renderer.resources;
                const c = this.renderer.scoreRenderer.canvas!;
                c.font = res.barNumberFont; // see note in paint()
                slurHeight += c.measureText('grad.').height;
            }

            if (slurHeight > maxSlurHeight) {
                maxSlurHeight = slurHeight;
            }
        }
        return maxSlurHeight;
    }

    public addBends(note: Note): void {
        this._notes.push(note);
        if (note.isTieOrigin) {
            return;
        }

        const color = ElementStyleHelper.noteColor(
            this.renderer.resources,
            NoteSubElement.StandardNotationEffects,
            note
        );

        switch (note.bendType) {
            case BendType.Bend:
            case BendType.PrebendRelease:
            case BendType.PrebendBend:
                {
                    let endGlyphs = this._endNoteGlyph;
                    if (!endGlyphs) {
                        endGlyphs = new BendNoteHeadGroupGlyph(note.beat, false);
                        endGlyphs.renderer = this.renderer;
                        this._endNoteGlyph = endGlyphs;
                        this.addGlyph(endGlyphs);
                    }
                    const lastBendPoint: BendPoint = note.bendPoints![note.bendPoints!.length - 1];
                    endGlyphs.addGlyph(
                        this._getBendNoteValue(note, lastBendPoint),
                        lastBendPoint.value % 2 !== 0,
                        color
                    );
                }
                break;
            case BendType.Release:
                {
                    if (!note.isTieOrigin) {
                        let endGlyphs = this._endNoteGlyph;
                        if (!endGlyphs) {
                            endGlyphs = new BendNoteHeadGroupGlyph(note.beat, false);
                            endGlyphs.renderer = this.renderer;
                            this._endNoteGlyph = endGlyphs;
                            this.addGlyph(endGlyphs);
                        }
                        const lastBendPoint: BendPoint = note.bendPoints![note.bendPoints!.length - 1];
                        endGlyphs.addGlyph(
                            this._getBendNoteValue(note, lastBendPoint),
                            lastBendPoint.value % 2 !== 0,
                            color
                        );
                    }
                }
                break;
            case BendType.BendRelease:
                {
                    let middleGlyphs = this._middleNoteGlyph;
                    if (!middleGlyphs) {
                        middleGlyphs = new BendNoteHeadGroupGlyph(note.beat, false);
                        this._middleNoteGlyph = middleGlyphs;
                        middleGlyphs.renderer = this.renderer;
                        this.addGlyph(middleGlyphs);
                    }
                    const middleBendPoint: BendPoint = note.bendPoints![1];
                    middleGlyphs.addGlyph(
                        this._getBendNoteValue(note, note.bendPoints![1]),
                        middleBendPoint.value % 2 !== 0,
                        color
                    );
                    let endGlyphs = this._endNoteGlyph;
                    if (!endGlyphs) {
                        endGlyphs = new BendNoteHeadGroupGlyph(note.beat, false);
                        endGlyphs.renderer = this.renderer;
                        this._endNoteGlyph = endGlyphs;
                        this.addGlyph(endGlyphs);
                    }
                    const lastBendPoint: BendPoint = note.bendPoints![note.bendPoints!.length - 1];
                    endGlyphs.addGlyph(
                        this._getBendNoteValue(note, lastBendPoint),
                        lastBendPoint.value % 2 !== 0,
                        color
                    );
                }
                break;
        }
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        // Draw note heads
        const startNoteRenderer: ScoreBarRenderer = this.renderer.scoreRenderer.layout!.getRendererForBar(
            this.renderer.staff!.staffId,
            this._beat.voice.bar
        )! as ScoreBarRenderer;
        const startX: number =
            cx + startNoteRenderer.x + startNoteRenderer.getBeatX(this._beat, BeatXPosition.MiddleNotes);
        let endBeatX: number = cx + startNoteRenderer.x;
        if (this._beat.isLastOfVoice) {
            endBeatX += startNoteRenderer.postBeatGlyphsStart;
        } else {
            endBeatX += startNoteRenderer.getBeatX(this._beat.nextBeat!, BeatXPosition.PreNotes);
        }

        if (this._endNoteGlyph) {
            endBeatX -= this._endNoteGlyph.upLineX;
        }

        const middleX: number = (startX + endBeatX) / 2;
        if (this._middleNoteGlyph) {
            this._middleNoteGlyph.x = middleX - this._middleNoteGlyph.noteHeadOffset;
            this._middleNoteGlyph.y = cy + startNoteRenderer.y;
            this._middleNoteGlyph.paint(0, 0, canvas);
        }
        if (this._endNoteGlyph) {
            this._endNoteGlyph.x = endBeatX - this._endNoteGlyph.noteHeadOffset;
            this._endNoteGlyph.y = cy + startNoteRenderer.y;
            this._endNoteGlyph.paint(0, 0, canvas);
        }
        this._notes.sort((a, b) => {
            return b.displayValue - a.displayValue;
        });
        const directionBeat: Beat = this._beat.graceType === GraceType.BendGrace ? this._beat.nextBeat! : this._beat;
        let direction: BeamDirection =
            this._notes.length === 1 ? this.getTieDirection(directionBeat, startNoteRenderer) : BeamDirection.Up;

        const noteHeadHeight = this.renderer.smuflMetrics.glyphHeights.get(MusicFontSymbol.NoteheadBlack)!;

        // draw slurs
        canvas.font = this.renderer.resources.barNumberFont; // we have never have set it explicitly, that's the current state
        for (let i: number = 0; i < this._notes.length; i++) {
            const note: Note = this._notes[i];
            using _ = ElementStyleHelper.note(canvas, NoteSubElement.StandardNotationEffects, note);
            if (i > 0 && i >= ((this._notes.length / 2) | 0)) {
                direction = BeamDirection.Down;
            }
            let startY: number = cy + startNoteRenderer.y + startNoteRenderer.getNoteY(note, NoteYPosition.Top);
            let heightOffset: number = noteHeadHeight * NoteHeadGlyph.GraceScale * 0.5;
            if (direction === BeamDirection.Down) {
                startY += noteHeadHeight;
            }
            const slurText: string = note.bendStyle === BendStyle.Gradual ? 'grad.' : '';
            if (note.isTieOrigin) {
                const endNote: Note = note.tieDestination!;
                const endNoteRenderer: ScoreBarRenderer | null = !endNote
                    ? null
                    : (this.renderer.scoreRenderer.layout!.getRendererForBar(
                          this.renderer.staff!.staffId,
                          endNote.beat.voice.bar
                      ) as ScoreBarRenderer);
                // if we have a line break we draw only a line until the end
                if (!endNoteRenderer || endNoteRenderer.staff !== startNoteRenderer.staff) {
                    const endX: number = cx + startNoteRenderer.x + startNoteRenderer.width;
                    const noteValueToDraw: number = note.tieDestination!.realValue;
                    startNoteRenderer.accidentalHelper.applyAccidentalForValue(note.beat, noteValueToDraw, false, true);
                    const endY: number =
                        cy +
                        startNoteRenderer.y +
                        startNoteRenderer.getScoreY(
                            startNoteRenderer.accidentalHelper.getNoteStepsForValue(noteValueToDraw, false)
                        );
                    if (note.bendType === BendType.Hold || note.bendType === BendType.Prebend) {
                        TieGlyph.paintTie(
                            canvas,
                            1,
                            startX,
                            startY,
                            endX,
                            endY,
                            direction === BeamDirection.Down,
                            this.renderer.smuflMetrics.tieHeight,
                            this.renderer.smuflMetrics.slurMidpointThickness
                        );
                    } else {
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
                } else {
                    const endX: number =
                        cx + endNoteRenderer.x + endNoteRenderer.getBeatX(endNote.beat, BeatXPosition.MiddleNotes);
                    let endY: number = cy + endNoteRenderer.y + endNoteRenderer.getNoteY(endNote, NoteYPosition.Top);
                    if (direction === BeamDirection.Down) {
                        endY += noteHeadHeight;
                    }
                    if (note.bendType === BendType.Hold || note.bendType === BendType.Prebend) {
                        TieGlyph.paintTie(
                            canvas,
                            1,
                            startX,
                            startY,
                            endX,
                            endY,
                            direction === BeamDirection.Down,
                            this.renderer.smuflMetrics.tieHeight,
                            this.renderer.smuflMetrics.slurMidpointThickness
                        );
                    } else {
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
                }
                switch (note.bendType) {
                    case BendType.Prebend:
                    case BendType.PrebendBend:
                    case BendType.PrebendRelease:
                        let preX: number =
                            cx + startNoteRenderer.x + startNoteRenderer.getBeatX(note.beat, BeatXPosition.PreNotes);
                        preX += (startNoteRenderer.getPreNotesGlyphForBeat(note.beat) as ScoreBeatPreNotesGlyph)
                            .prebendNoteHeadOffset;
                        const preY: number =
                            cy +
                            startNoteRenderer.y +
                            startNoteRenderer.getScoreY(
                                startNoteRenderer.accidentalHelper.getNoteStepsForValue(
                                    note.displayValue - ((note.bendPoints![0].value / 2) | 0),
                                    false
                                )
                            ) +
                            heightOffset;
                        this.drawBendSlur(canvas, preX, preY, startX, startY, direction === BeamDirection.Down, 1);
                        break;
                }
            } else {
                if (direction === BeamDirection.Up) {
                    heightOffset = -heightOffset;
                }
                let endValue: number = 0;
                let endY: number = 0;
                switch (note.bendType) {
                    case BendType.Bend:
                        endValue = this._getBendNoteValue(note, note.bendPoints![note.bendPoints!.length - 1]);
                        endY = this._endNoteGlyph!.getNoteValueY(endValue) + heightOffset;
                        this.drawBendSlur(
                            canvas,
                            startX,
                            startY,
                            endBeatX,
                            endY,
                            direction === BeamDirection.Down,
                            1,
                            slurText
                        );
                        break;
                    case BendType.BendRelease:
                        const middleValue: number = this._getBendNoteValue(note, note.bendPoints![1]);
                        const middleY: number = this._middleNoteGlyph!.getNoteValueY(middleValue) + heightOffset;
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
                        endValue = this._getBendNoteValue(note, note.bendPoints![note.bendPoints!.length - 1]);
                        endY = this._endNoteGlyph!.getNoteValueY(endValue) + heightOffset;
                        this.drawBendSlur(
                            canvas,
                            middleX,
                            middleY,
                            endBeatX,
                            endY,
                            direction === BeamDirection.Down,
                            1,
                            slurText
                        );
                        break;
                    case BendType.Release:
                        if (this.glyphs) {
                            endValue = this._getBendNoteValue(note, note.bendPoints![note.bendPoints!.length - 1]);
                            endY = (this.glyphs[0] as BendNoteHeadGroupGlyph).getNoteValueY(endValue) + heightOffset;
                            this.drawBendSlur(
                                canvas,
                                startX,
                                startY,
                                endBeatX,
                                endY,
                                direction === BeamDirection.Down,
                                1,
                                slurText
                            );
                        }
                        break;
                    case BendType.Prebend:
                    case BendType.PrebendBend:
                    case BendType.PrebendRelease:
                        let preX: number =
                            cx + startNoteRenderer.x + startNoteRenderer.getBeatX(note.beat, BeatXPosition.PreNotes);
                        preX += (startNoteRenderer.getPreNotesGlyphForBeat(note.beat) as ScoreBeatPreNotesGlyph)
                            .prebendNoteHeadOffset;
                        const preY: number =
                            cy +
                            startNoteRenderer.y +
                            startNoteRenderer.getScoreY(
                                startNoteRenderer.accidentalHelper.getNoteStepsForValue(
                                    note.displayValue - ((note.bendPoints![0].value / 2) | 0),
                                    false
                                )
                            ) +
                            heightOffset;
                        this.drawBendSlur(canvas, preX, preY, startX, startY, direction === BeamDirection.Down, 1);
                        if (this.glyphs) {
                            endValue = this._getBendNoteValue(note, note.bendPoints![note.bendPoints!.length - 1]);
                            endY = (this.glyphs[0] as BendNoteHeadGroupGlyph).getNoteValueY(endValue) + heightOffset;
                            this.drawBendSlur(
                                canvas,
                                startX,
                                startY,
                                endBeatX,
                                endY,
                                direction === BeamDirection.Down,
                                1,
                                slurText
                            );
                        }
                        break;
                }
            }
        }
    }

    private _getBendNoteValue(note: Note, bendPoint: BendPoint): number {
        // NOTE: bendpoints are in 1/4 tones, but the note values are in 1/2 notes.
        return note.displayValueWithoutBend + ((bendPoint.value / 2) | 0);
    }
}
