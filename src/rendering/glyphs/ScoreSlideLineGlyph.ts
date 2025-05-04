import type { Beat } from '@src/model/Beat';
import type { Note } from '@src/model/Note';
import { SlideInType } from '@src/model/SlideInType';
import { SlideOutType } from '@src/model/SlideOutType';
import { VibratoType } from '@src/model/VibratoType';
import type { ICanvas } from '@src/platform/ICanvas';
import { type BarRendererBase, NoteXPosition, NoteYPosition } from '@src/rendering/BarRendererBase';
import { BeatXPosition } from '@src/rendering/BeatXPosition';
import type { BeatContainerGlyph } from '@src/rendering/glyphs/BeatContainerGlyph';
import { Glyph } from '@src/rendering/glyphs/Glyph';
import { NoteVibratoGlyph } from '@src/rendering/glyphs/NoteVibratoGlyph';
import type { ScoreBeatPreNotesGlyph } from '@src/rendering/glyphs/ScoreBeatPreNotesGlyph';
import type { ScoreBarRenderer } from '@src/rendering/ScoreBarRenderer';

export class ScoreSlideLineGlyph extends Glyph {
    private _outType: SlideOutType;
    private _inType: SlideInType;
    private _startNote: Note;
    private _parent: BeatContainerGlyph;

    public constructor(inType: SlideInType, outType: SlideOutType, startNote: Note, parent: BeatContainerGlyph) {
        super(0, 0);
        this._outType = outType;
        this._inType = inType;
        this._startNote = startNote;
        this._parent = parent;
    }

    public override doLayout(): void {
        this.width = 0;
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        this.paintSlideIn(cx, cy, canvas);
        this.drawSlideOut(cx, cy, canvas);
    }

    private paintSlideIn(cx: number, cy: number, canvas: ICanvas): void {
        const startNoteRenderer: ScoreBarRenderer = this.renderer as ScoreBarRenderer;
        const sizeX: number = 12;
        let endX = cx + startNoteRenderer.x + startNoteRenderer.getNoteX(this._startNote, NoteXPosition.Left) - 2;
        const endY = cy + startNoteRenderer.y + startNoteRenderer.getNoteY(this._startNote, NoteYPosition.Center);
        let startX = endX - sizeX;
        let startY: number = cy + startNoteRenderer.y;

        switch (this._inType) {
            case SlideInType.IntoFromBelow:
                startY += startNoteRenderer.getNoteY(this._startNote, NoteYPosition.Bottom);
                break;
            case SlideInType.IntoFromAbove:
                startY += startNoteRenderer.getNoteY(this._startNote, NoteYPosition.Top);
                break;
            default:
                return;
        }

        const accidentalsWidth: number = this.getAccidentalsWidth(startNoteRenderer, this._startNote.beat);
        startX -= accidentalsWidth;
        endX -= accidentalsWidth;
        this.paintSlideLine(canvas, false, startX, endX, startY, endY);
    }

    private getAccidentalsWidth(renderer: ScoreBarRenderer, beat: Beat): number {
        const preNotes: ScoreBeatPreNotesGlyph = renderer.getPreNotesGlyphForBeat(beat) as ScoreBeatPreNotesGlyph;
        if (preNotes && preNotes.accidentals) {
            return preNotes.accidentals.width;
        }
        return 0;
    }

    private drawSlideOut(cx: number, cy: number, canvas: ICanvas): void {
        const startNoteRenderer: ScoreBarRenderer = this.renderer as ScoreBarRenderer;
        const sizeX: number = 12;
        const offsetX: number = 2;
        const offsetY: number = 2;
        let startX: number = 0;
        let startY: number = 0;
        let endX: number = 0;
        let endY: number = 0;
        let waves: boolean = false;
        switch (this._outType) {
            case SlideOutType.Shift:
            case SlideOutType.Legato:
                startX =
                    cx +
                    startNoteRenderer.x +
                    startNoteRenderer.getBeatX(this._startNote.beat, BeatXPosition.PostNotes) +
                    offsetX;
                startY = cy + startNoteRenderer.y + startNoteRenderer.getNoteY(this._startNote, NoteYPosition.Center);
                if (this._startNote.slideTarget) {
                    const endNoteRenderer: BarRendererBase | null =
                        this.renderer.scoreRenderer.layout!.getRendererForBar(
                            this.renderer.staff.staffId,
                            this._startNote.slideTarget.beat.voice.bar
                        );
                    if (!endNoteRenderer || endNoteRenderer.staff !== startNoteRenderer.staff) {
                        endX = cx + startNoteRenderer.x + startNoteRenderer.width;
                        endY = startY;
                    } else {
                        endX =
                            cx +
                            endNoteRenderer.x +
                            endNoteRenderer.getBeatX(this._startNote.slideTarget.beat, BeatXPosition.PreNotes) -
                            offsetX;
                        endY =
                            cy +
                            endNoteRenderer.y +
                            endNoteRenderer.getNoteY(this._startNote.slideTarget, NoteYPosition.Center);
                    }

                    if (this._startNote.slideTarget.realValue > this._startNote.realValue) {
                        startY += offsetY;
                        endY -= offsetY;
                    } else {
                        startY -= offsetY;
                        endY += offsetY;
                    }
                } else {
                    endX = cx + startNoteRenderer.x + this._parent.x;
                    endY = startY;
                }
                break;
            case SlideOutType.OutUp:
                startX =
                    cx +
                    startNoteRenderer.x +
                    startNoteRenderer.getNoteX(this._startNote, NoteXPosition.Right) +
                    offsetX;
                startY = cy + startNoteRenderer.y + startNoteRenderer.getNoteY(this._startNote, NoteYPosition.Center);
                endX = startX + sizeX;
                endY = cy + startNoteRenderer.y + startNoteRenderer.getNoteY(this._startNote, NoteYPosition.Top);
                break;
            case SlideOutType.OutDown:
                startX =
                    cx +
                    startNoteRenderer.x +
                    startNoteRenderer.getNoteX(this._startNote, NoteXPosition.Right) +
                    offsetX;
                startY = cy + startNoteRenderer.y + startNoteRenderer.getNoteY(this._startNote, NoteYPosition.Center);
                endX = startX + sizeX;
                endY = cy + startNoteRenderer.y + startNoteRenderer.getNoteY(this._startNote, NoteYPosition.Bottom);
                break;
            case SlideOutType.PickSlideUp:
                startX =
                    cx +
                    startNoteRenderer.x +
                    startNoteRenderer.getNoteX(this._startNote, NoteXPosition.Right) +
                    offsetX * 2;
                startY = cy + startNoteRenderer.y + startNoteRenderer.getNoteY(this._startNote, NoteYPosition.Center);
                endY = cy + startNoteRenderer.y + startNoteRenderer.getNoteY(this._startNote, NoteYPosition.Top);
                endX = cx + startNoteRenderer.x + startNoteRenderer.width;
                if (
                    this._startNote.beat.nextBeat &&
                    this._startNote.beat.nextBeat.voice === this._startNote.beat.voice
                ) {
                    endX =
                        cx +
                        startNoteRenderer.x +
                        startNoteRenderer.getBeatX(this._startNote.beat.nextBeat, BeatXPosition.PreNotes);
                }
                waves = true;
                break;
            case SlideOutType.PickSlideDown:
                startX =
                    cx +
                    startNoteRenderer.x +
                    startNoteRenderer.getNoteX(this._startNote, NoteXPosition.Right) +
                    offsetX * 2;
                startY = cy + startNoteRenderer.y + startNoteRenderer.getNoteY(this._startNote, NoteYPosition.Center);
                endY = cy + startNoteRenderer.y + startNoteRenderer.getNoteY(this._startNote, NoteYPosition.Bottom);
                endX = cx + startNoteRenderer.x + startNoteRenderer.width;
                if (
                    this._startNote.beat.nextBeat &&
                    this._startNote.beat.nextBeat.voice === this._startNote.beat.voice
                ) {
                    endX =
                        cx +
                        startNoteRenderer.x +
                        startNoteRenderer.getBeatX(this._startNote.beat.nextBeat, BeatXPosition.PreNotes);
                }
                waves = true;
                break;
            default:
                return;
        }
        this.paintSlideLine(canvas, waves, startX, endX, startY, endY);
    }

    private paintSlideLine(
        canvas: ICanvas,
        waves: boolean,
        startX: number,
        endX: number,
        startY: number,
        endY: number
    ): void {
        if (waves) {
            const glyph: NoteVibratoGlyph = new NoteVibratoGlyph(0, 0, VibratoType.Slight, 1.2);
            glyph.renderer = this.renderer;
            glyph.doLayout();

            startY -= glyph.height / 2;
            endY -= glyph.height / 2;

            const b: number = endX - startX;
            const a: number = endY - startY;
            const c: number = Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));
            glyph.width = b;

            const angle: number = Math.asin(a / c) * (180 / Math.PI);
            canvas.beginRotate(startX, startY, angle);
            glyph.paint(0, 0, canvas);
            canvas.endRotate();
        } else {
            canvas.beginPath();
            canvas.moveTo(startX, startY);
            canvas.lineTo(endX, endY);
            canvas.stroke();
        }
    }
}
