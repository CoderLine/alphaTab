import { Beat } from '@src/model/Beat';
import { Note } from '@src/model/Note';
import { SlideInType } from '@src/model/SlideInType';
import { SlideOutType } from '@src/model/SlideOutType';
import { VibratoType } from '@src/model/VibratoType';
import { ICanvas } from '@src/platform/ICanvas';
import { BarRendererBase } from '@src/rendering/BarRendererBase';
import { BeatXPosition } from '@src/rendering/BeatXPosition';
import { BeatContainerGlyph } from '@src/rendering/glyphs/BeatContainerGlyph';
import { Glyph } from '@src/rendering/glyphs/Glyph';
import { NoteVibratoGlyph } from '@src/rendering/glyphs/NoteVibratoGlyph';
import { ScoreBeatPreNotesGlyph } from '@src/rendering/glyphs/ScoreBeatPreNotesGlyph';
import { ScoreBarRenderer } from '@src/rendering/ScoreBarRenderer';
import { NoteHeadGlyph } from '@src/rendering/glyphs/NoteHeadGlyph';

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

    public doLayout(): void {
        this.width = 0;
    }

    public paint(cx: number, cy: number, canvas: ICanvas): void {
        this.paintSlideIn(cx, cy, canvas);
        this.drawSlideOut(cx, cy, canvas);
    }

    private paintSlideIn(cx: number, cy: number, canvas: ICanvas): void {
        let startNoteRenderer: ScoreBarRenderer = this.renderer as ScoreBarRenderer;
        let sizeX: number = 12 * this.scale;
        let offsetX: number = 1 * this.scale;
        let startX: number = 0;
        let startY: number = 0;
        let endX: number = 0;
        let endY: number = 0;
        switch (this._inType) {
            case SlideInType.IntoFromBelow:
                endX = cx + startNoteRenderer.x + startNoteRenderer.getNoteX(this._startNote, false) - offsetX;
                endY = cy + startNoteRenderer.y + startNoteRenderer.getNoteY(this._startNote, true) + NoteHeadGlyph.NoteHeadHeight / 2;
                startX = endX - sizeX;
                startY = cy + startNoteRenderer.y + startNoteRenderer.getNoteY(this._startNote, true) + NoteHeadGlyph.NoteHeadHeight;
                break;
            case SlideInType.IntoFromAbove:
                endX = cx + startNoteRenderer.x + startNoteRenderer.getNoteX(this._startNote, false) - offsetX;
                endY = cy + startNoteRenderer.y + startNoteRenderer.getNoteY(this._startNote, true) + NoteHeadGlyph.NoteHeadHeight / 2;
                startX = endX - sizeX;
                startY = cy + startNoteRenderer.y + startNoteRenderer.getNoteY(this._startNote, true);
                break;
            default:
                return;
        }
        let accidentalsWidth: number = this.getAccidentalsWidth(startNoteRenderer, this._startNote.beat);
        startX -= accidentalsWidth;
        endX -= accidentalsWidth;
        this.paintSlideLine(canvas, false, startX, endX, startY, endY);
    }

    private getAccidentalsWidth(renderer: ScoreBarRenderer, beat: Beat): number {
        let preNotes: ScoreBeatPreNotesGlyph = renderer.getPreNotesGlyphForBeat(beat) as ScoreBeatPreNotesGlyph;
        if (preNotes && preNotes.accidentals) {
            return preNotes.accidentals.width;
        }
        return 0;
    }

    private drawSlideOut(cx: number, cy: number, canvas: ICanvas): void {
        let startNoteRenderer: ScoreBarRenderer = this.renderer as ScoreBarRenderer;
        let sizeX: number = 12 * this.scale;
        let offsetX: number = 1 * this.scale;
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
                let isUp: boolean = this._startNote.slideTarget!.realValue > this._startNote.realValue;
                startY = cy + startNoteRenderer.y + startNoteRenderer.getNoteY(this._startNote, false);
                let lineOffset: number = 0.25 * NoteHeadGlyph.NoteHeadHeight * this.scale;
                if (isUp) {
                    startY += lineOffset;
                } else {
                    startY -= lineOffset;
                }
                if (this._startNote.slideTarget) {
                    let endNoteRenderer: BarRendererBase | null = this.renderer.scoreRenderer.layout!.getRendererForBar(
                        this.renderer.staff.staveId,
                        this._startNote.slideTarget.beat.voice.bar
                    ) as BarRendererBase;
                    if (!endNoteRenderer || endNoteRenderer.staff !== startNoteRenderer.staff) {
                        endX = cx + startNoteRenderer.x + this._parent.x;
                        endY = startY;
                    } else {
                        endX =
                            cx +
                            endNoteRenderer.x +
                            endNoteRenderer.getBeatX(this._startNote.slideTarget.beat, BeatXPosition.PreNotes) -
                            offsetX;
                        endY = cy + endNoteRenderer.y + endNoteRenderer.getNoteY(this._startNote.slideTarget, false);
                        if (isUp) {
                            endY -= lineOffset;
                        } else {
                            endY += lineOffset;
                        }
                    }
                } else {
                    endX = cx + startNoteRenderer.x + this._parent.x;
                    endY = startY;
                }
                break;
            case SlideOutType.OutUp:
                startX = cx + startNoteRenderer.x + startNoteRenderer.getNoteX(this._startNote, true) + offsetX * 2;
                startY = cy + startNoteRenderer.y + startNoteRenderer.getNoteY(this._startNote, true) + NoteHeadGlyph.NoteHeadHeight / 2;
                endX = startX + sizeX;
                endY = cy + startNoteRenderer.y + startNoteRenderer.getNoteY(this._startNote, true);
                break;
            case SlideOutType.OutDown:
                startX = cx + startNoteRenderer.x + startNoteRenderer.getNoteX(this._startNote, true) + offsetX * 2;
                startY = cy + startNoteRenderer.y + startNoteRenderer.getNoteY(this._startNote, true) + NoteHeadGlyph.NoteHeadHeight / 2;
                endX = startX + sizeX;
                endY = cy + startNoteRenderer.y + startNoteRenderer.getNoteY(this._startNote, true) + NoteHeadGlyph.NoteHeadHeight;
                break;
            case SlideOutType.PickSlideUp:
                startX = cx + startNoteRenderer.x + startNoteRenderer.getNoteX(this._startNote, true) + offsetX * 2;
                startY = cy + startNoteRenderer.y + startNoteRenderer.getNoteY(this._startNote, true) + NoteHeadGlyph.NoteHeadHeight / 2;
                endY = cy + startNoteRenderer.y + startNoteRenderer.getNoteY(this._startNote, true) - NoteHeadGlyph.NoteHeadHeight;
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
                startX = cx + startNoteRenderer.x + startNoteRenderer.getNoteX(this._startNote, true) + offsetX * 2;
                startY = cy + startNoteRenderer.y + startNoteRenderer.getNoteY(this._startNote, true) - NoteHeadGlyph.NoteHeadHeight / 2;
                endY = cy + startNoteRenderer.y + startNoteRenderer.getNoteY(this._startNote, true) + NoteHeadGlyph.NoteHeadHeight;
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
            let b: number = endX - startX;
            let a: number = endY - startY;
            let c: number = Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));
            let angle: number = (Math.asin(a / c) * (180 / Math.PI)) as number;
            canvas.beginRotate(startX, startY, angle);
            let glyph: NoteVibratoGlyph = new NoteVibratoGlyph(0, 0, VibratoType.Slight, 1.2);
            glyph.renderer = this.renderer;
            glyph.doLayout();
            glyph.width = b;
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
