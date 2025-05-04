import type { Beat } from '@src/model/Beat';
import type { BendPoint } from '@src/model/BendPoint';
import { BendStyle } from '@src/model/BendStyle';
import { BendType } from '@src/model/BendType';
import { GraceType } from '@src/model/GraceType';
import { type Note, NoteSubElement } from '@src/model/Note';
import type { ICanvas } from '@src/platform/ICanvas';
import { BeatXPosition } from '@src/rendering/BeatXPosition';
import { BendNoteHeadGroupGlyph } from '@src/rendering/glyphs/BendNoteHeadGroupGlyph';
import type { ScoreBeatPreNotesGlyph } from '@src/rendering/glyphs/ScoreBeatPreNotesGlyph';
import { ScoreHelperNotesBaseGlyph } from '@src/rendering/glyphs/ScoreHelperNotesBaseGlyph';
import { TieGlyph } from '@src/rendering/glyphs/TieGlyph';
import type { ScoreBarRenderer } from '@src/rendering/ScoreBarRenderer';
import { BeamDirection } from '@src/rendering/utils/BeamDirection';
import { NoteHeadGlyph } from '@src/rendering/glyphs/NoteHeadGlyph';
import { NoteYPosition } from '@src/rendering/BarRendererBase';
import { ElementStyleHelper } from '@src/rendering/utils/ElementStyleHelper';
import { MusicFontSymbolSizes } from '@src/rendering/utils/MusicFontSymbolSizes';
import { MusicFontSymbol } from '@src/model/MusicFontSymbol';

export class ScoreBendGlyph extends ScoreHelperNotesBaseGlyph {
    private _beat: Beat;
    private _notes: Note[] = [];
    private _endNoteGlyph: BendNoteHeadGroupGlyph | null = null;
    private _middleNoteGlyph: BendNoteHeadGroupGlyph | null = null;

    public constructor(beat: Beat) {
        super(0, 0);
        this._beat = beat;
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
                        this.BendNoteHeads.push(endGlyphs);
                    }
                    const lastBendPoint: BendPoint = note.bendPoints![note.bendPoints!.length - 1];
                    endGlyphs.addGlyph(
                        this.getBendNoteValue(note, lastBendPoint),
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
                            this.BendNoteHeads.push(endGlyphs);
                        }
                        const lastBendPoint: BendPoint = note.bendPoints![note.bendPoints!.length - 1];
                        endGlyphs.addGlyph(
                            this.getBendNoteValue(note, lastBendPoint),
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
                        this.BendNoteHeads.push(middleGlyphs);
                    }
                    const middleBendPoint: BendPoint = note.bendPoints![1];
                    middleGlyphs.addGlyph(
                        this.getBendNoteValue(note, note.bendPoints![1]),
                        middleBendPoint.value % 2 !== 0,
                        color
                    );
                    let endGlyphs = this._endNoteGlyph;
                    if (!endGlyphs) {
                        endGlyphs = new BendNoteHeadGroupGlyph(note.beat, false);
                        endGlyphs.renderer = this.renderer;
                        this._endNoteGlyph = endGlyphs;
                        this.BendNoteHeads.push(endGlyphs);
                    }
                    const lastBendPoint: BendPoint = note.bendPoints![note.bendPoints!.length - 1];
                    endGlyphs.addGlyph(
                        this.getBendNoteValue(note, lastBendPoint),
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
            this.renderer.staff.staffId,
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
        endBeatX -= 8;
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

        const noteHeadHeight = MusicFontSymbolSizes.Heights.get(MusicFontSymbol.NoteheadBlack)!;

        // draw slurs
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
                          this.renderer.staff.staffId,
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
                            startNoteRenderer.accidentalHelper.getNoteLineForValue(noteValueToDraw, false)
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
                            22,
                            4
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
                            22,
                            4
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
                                startNoteRenderer.accidentalHelper.getNoteLineForValue(
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
                        endValue = this.getBendNoteValue(note, note.bendPoints![note.bendPoints!.length - 1]);
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
                        const middleValue: number = this.getBendNoteValue(note, note.bendPoints![1]);
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
                        endValue = this.getBendNoteValue(note, note.bendPoints![note.bendPoints!.length - 1]);
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
                        if (this.BendNoteHeads.length > 0) {
                            endValue = this.getBendNoteValue(note, note.bendPoints![note.bendPoints!.length - 1]);
                            endY = this.BendNoteHeads[0].getNoteValueY(endValue) + heightOffset;
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
                                startNoteRenderer.accidentalHelper.getNoteLineForValue(
                                    note.displayValue - ((note.bendPoints![0].value / 2) | 0),
                                    false
                                )
                            ) +
                            heightOffset;
                        this.drawBendSlur(canvas, preX, preY, startX, startY, direction === BeamDirection.Down, 1);
                        if (this.BendNoteHeads.length > 0) {
                            endValue = this.getBendNoteValue(note, note.bendPoints![note.bendPoints!.length - 1]);
                            endY = this.BendNoteHeads[0].getNoteValueY(endValue) + heightOffset;
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

    private getBendNoteValue(note: Note, bendPoint: BendPoint): number {
        // NOTE: bendpoints are in 1/4 tones, but the note values are in 1/2 notes.
        return note.displayValueWithoutBend + ((bendPoint.value / 2) | 0);
    }
}
