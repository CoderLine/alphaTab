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
import { TabBarRenderer } from '@src/rendering/TabBarRenderer';

export class TabSlideLineGlyph extends Glyph {
    private _inType: SlideInType;
    private _outType: SlideOutType;
    private _startNote: Note;
    private _parent: BeatContainerGlyph;

    public constructor(inType: SlideInType, outType: SlideOutType, startNote: Note, parent: BeatContainerGlyph) {
        super(0, 0);
        this._inType = inType;
        this._outType = outType;
        this._startNote = startNote;
        this._parent = parent;
    }

    public doLayout(): void {
        this.width = 0;
    }

    public paint(cx: number, cy: number, canvas: ICanvas): void {
        this.paintSlideIn(cx, cy, canvas);
        this.paintSlideOut(cx, cy, canvas);
    }

    private paintSlideIn(cx: number, cy: number, canvas: ICanvas): void {
        let startNoteRenderer: TabBarRenderer = this.renderer as TabBarRenderer;
        let sizeX: number = 12 * this.scale;
        let sizeY: number = 3 * this.scale;
        let startX: number = 0;
        let startY: number = 0;
        let endX: number = 0;
        let endY: number = 0;
        switch (this._inType) {
            case SlideInType.IntoFromBelow:
                endX = cx + startNoteRenderer.x + startNoteRenderer.getNoteX(this._startNote, false);
                endY = cy + startNoteRenderer.y + startNoteRenderer.getNoteY(this._startNote, false);
                startX = endX - sizeX;
                startY = cy + startNoteRenderer.y + startNoteRenderer.getNoteY(this._startNote, false) + sizeY;
                break;
            case SlideInType.IntoFromAbove:
                endX = cx + startNoteRenderer.x + startNoteRenderer.getNoteX(this._startNote, false);
                endY = cy + startNoteRenderer.y + startNoteRenderer.getNoteY(this._startNote, false);
                startX = endX - sizeX;
                startY = cy + startNoteRenderer.y + startNoteRenderer.getNoteY(this._startNote, false) - sizeY;
                break;
            default:
                return;
        }
        this.paintSlideLine(canvas, false, startX, endX, startY, endY);
    }

    private paintSlideOut(cx: number, cy: number, canvas: ICanvas): void {
        let startNoteRenderer: TabBarRenderer = this.renderer as TabBarRenderer;
        let sizeX: number = 12 * this.scale;
        let sizeY: number = 3 * this.scale;
        let startX: number = 0;
        let startY: number = 0;
        let endX: number = 0;
        let endY: number = 0;
        let waves: boolean = false;
        switch (this._outType) {
            case SlideOutType.Shift:
            case SlideOutType.Legato:
                let startOffsetY: number = 0;
                let endOffsetY: number = 0;
                if (!this._startNote.slideTarget) {
                    startOffsetY = 0;
                    endOffsetY = 0;
                } else if (this._startNote.slideTarget.fret > this._startNote.fret) {
                    startOffsetY = sizeY;
                    endOffsetY = sizeY * -1;
                } else {
                    startOffsetY = sizeY * -1;
                    endOffsetY = sizeY;
                }
                startX =
                    cx +
                    startNoteRenderer.x +
                    startNoteRenderer.getBeatX(this._startNote.beat, BeatXPosition.PostNotes);
                startY = cy + startNoteRenderer.y + startNoteRenderer.getNoteY(this._startNote, false) + startOffsetY;
                if (this._startNote.slideTarget) {
                    let endNoteRenderer: BarRendererBase = this.renderer.scoreRenderer.layout!.getRendererForBar<BarRendererBase>(
                        this.renderer.staff.staveId,
                        this._startNote.slideTarget.beat.voice.bar
                    )!;
                    if (!endNoteRenderer || endNoteRenderer.staff !== startNoteRenderer.staff) {
                        endX = cx + startNoteRenderer.x + this._parent.x;
                        endY = startY;
                    } else {
                        endX =
                            cx +
                            endNoteRenderer.x +
                            endNoteRenderer.getBeatX(this._startNote.slideTarget.beat, BeatXPosition.OnNotes);
                        endY =
                            cy +
                            endNoteRenderer.y +
                            endNoteRenderer.getNoteY(this._startNote.slideTarget, false) +
                            endOffsetY;
                    }
                } else {
                    endX = cx + startNoteRenderer.x + this._parent.x;
                    endY = startY;
                }
                break;
            case SlideOutType.OutUp:
                startX = cx + startNoteRenderer.x + startNoteRenderer.getNoteX(this._startNote, true);
                startY = cy + startNoteRenderer.y + startNoteRenderer.getNoteY(this._startNote, false);
                endX = startX + sizeX;
                endY = cy + startNoteRenderer.y + startNoteRenderer.getNoteY(this._startNote, false) - sizeY;
                break;
            case SlideOutType.OutDown:
                startX = cx + startNoteRenderer.x + startNoteRenderer.getNoteX(this._startNote, true);
                startY = cy + startNoteRenderer.y + startNoteRenderer.getNoteY(this._startNote, false);
                endX = startX + sizeX;
                endY = cy + startNoteRenderer.y + startNoteRenderer.getNoteY(this._startNote, false) + sizeY;
                break;
            case SlideOutType.PickSlideDown:
                startX = cx + startNoteRenderer.x + startNoteRenderer.getNoteX(this._startNote, true);
                startY = cy + startNoteRenderer.y + startNoteRenderer.getNoteY(this._startNote, false) - sizeY * 2;
                endX =
                    cx + startNoteRenderer.x + startNoteRenderer.getBeatX(this._startNote.beat, BeatXPosition.EndBeat);
                endY = startY + sizeY * 3;
                waves = true;
                break;
            case SlideOutType.PickSlideUp:
                startX = cx + startNoteRenderer.x + startNoteRenderer.getNoteX(this._startNote, true);
                startY = cy + startNoteRenderer.y + startNoteRenderer.getNoteY(this._startNote, false) + sizeY;
                endX =
                    cx + startNoteRenderer.x + startNoteRenderer.getBeatX(this._startNote.beat, BeatXPosition.EndBeat);
                endY = startY - sizeY * 3;
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
            let angle: number = Math.asin(a / c) * (180 / Math.PI);
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
