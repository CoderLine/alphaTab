import { Beat } from '@src/model/Beat';
import { BendStyle } from '@src/model/BendStyle';
import { BendType } from '@src/model/BendType';
import { Color } from '@src/model/Color';
import { Note } from '@src/model/Note';
import { ICanvas } from '@src/platform/ICanvas';
import { BarRendererBase, NoteYPosition, NoteXPosition } from '@src/rendering/BarRendererBase';
import { BeatXPosition } from '@src/rendering/BeatXPosition';
import { Glyph } from '@src/rendering/glyphs/Glyph';
import { TabBendRenderPoint } from '@src/rendering/glyphs/TabBendRenderPoint';
import { TabBarRenderer } from '@src/rendering/TabBarRenderer';
import { RenderingResources } from '@src/RenderingResources';
import { BendPoint } from '@src/model/BendPoint';

export class TabBendGlyph extends Glyph {
    private static readonly ArrowSize: number = 6;
    private static readonly DashSize: number = 3;
    private static readonly BendValueHeight: number = 6;

    private _notes: Note[] = [];
    private _renderPoints: Map<number, TabBendRenderPoint[]> = new Map();
    private _preBendMinValue: number = -1;
    private _bendMiddleMinValue: number = -1;
    private _bendEndMinValue: number = -1;
    private _bendEndContinuedMinValue: number = -1;
    private _releaseMinValue: number = -1;
    private _releaseContinuedMinValue: number = -1;
    private _maxBendValue: number = -1;

    public constructor() {
        super(0, 0);
    }

    public addBends(note: Note): void {
        this._notes.push(note);
        let renderPoints: TabBendRenderPoint[] = this.createRenderingPoints(note);
        this._renderPoints.set(note.id, renderPoints);
        if (this._maxBendValue === -1 || this._maxBendValue < note.maxBendPoint!.value) {
            this._maxBendValue = note.maxBendPoint!.value;
        }
        // compute arrow end values for common bend types
        let value: number = 0;
        switch (note.bendType) {
            case BendType.Bend:
                value = renderPoints[1].value;
                if (note.isTieOrigin) {
                    if (this._bendEndContinuedMinValue === -1 || value < this._bendEndContinuedMinValue) {
                        this._bendEndContinuedMinValue = value;
                    }
                } else {
                    if (this._bendEndMinValue === -1 || value < this._bendEndMinValue) {
                        this._bendEndMinValue = value;
                    }
                }
                break;
            case BendType.Release:
                value = renderPoints[1].value;
                if (note.isTieOrigin) {
                    if (this._releaseContinuedMinValue === -1 || value < this._releaseContinuedMinValue) {
                        this._releaseContinuedMinValue = value;
                    }
                } else {
                    if (value > 0 && (this._releaseMinValue === -1 || value < this._releaseMinValue)) {
                        this._releaseMinValue = value;
                    }
                }
                break;
            case BendType.BendRelease:
                value = renderPoints[1].value;
                if (this._bendMiddleMinValue === -1 || value < this._bendMiddleMinValue) {
                    this._bendMiddleMinValue = value;
                }
                value = renderPoints[2].value;
                if (note.isTieOrigin) {
                    if (this._releaseContinuedMinValue === -1 || value < this._releaseContinuedMinValue) {
                        this._releaseContinuedMinValue = value;
                    }
                } else {
                    if (value > 0 && (this._releaseMinValue === -1 || value < this._releaseMinValue)) {
                        this._releaseMinValue = value;
                    }
                }
                break;
            case BendType.Prebend:
                value = renderPoints[0].value;
                if (this._preBendMinValue === -1 || value < this._preBendMinValue) {
                    this._preBendMinValue = value;
                }
                break;
            case BendType.PrebendBend:
                value = renderPoints[0].value;
                if (this._preBendMinValue === -1 || value < this._preBendMinValue) {
                    this._preBendMinValue = value;
                }
                value = renderPoints[1].value;
                if (note.isTieOrigin) {
                    if (this._bendEndContinuedMinValue === -1 || value < this._bendEndContinuedMinValue) {
                        this._bendEndContinuedMinValue = value;
                    }
                } else {
                    if (this._bendEndMinValue === -1 || value < this._bendEndMinValue) {
                        this._bendEndMinValue = value;
                    }
                }
                break;
            case BendType.PrebendRelease:
                value = renderPoints[0].value;
                if (this._preBendMinValue === -1 || value < this._preBendMinValue) {
                    this._preBendMinValue = value;
                }
                value = renderPoints[1].value;
                if (note.isTieOrigin) {
                    if (this._releaseContinuedMinValue === -1 || value < this._releaseContinuedMinValue) {
                        this._releaseContinuedMinValue = value;
                    }
                } else {
                    if (value > 0 && (this._releaseMinValue === -1 || value < this._releaseMinValue)) {
                        this._releaseMinValue = value;
                    }
                }
                break;
        }
    }

    public doLayout(): void {
        super.doLayout();
        let bendHeight: number = this._maxBendValue * TabBendGlyph.BendValueHeight * this.scale;
        this.renderer.registerOverflowTop(bendHeight);
        let value: number = 0;
        for (let note of this._notes) {
            let renderPoints: TabBendRenderPoint[] = this._renderPoints.get(note.id)!;
            switch (note.bendType) {
                case BendType.Bend:
                    renderPoints[1].lineValue = note.isTieOrigin
                        ? this._bendEndContinuedMinValue
                        : this._bendEndMinValue;
                    break;
                case BendType.Release:
                    value = note.isTieOrigin ? this._releaseContinuedMinValue : this._releaseMinValue;
                    if (value >= 0) {
                        renderPoints[1].lineValue = value;
                    }
                    break;
                case BendType.BendRelease:
                    renderPoints[1].lineValue = this._bendMiddleMinValue;
                    value = note.isTieOrigin ? this._releaseContinuedMinValue : this._releaseMinValue;
                    if (value >= 0) {
                        renderPoints[2].lineValue = value;
                    }
                    break;
                case BendType.Prebend:
                    renderPoints[0].lineValue = this._preBendMinValue;
                    break;
                case BendType.PrebendBend:
                    renderPoints[0].lineValue = this._preBendMinValue;
                    renderPoints[1].lineValue = note.isTieOrigin
                        ? this._bendEndContinuedMinValue
                        : this._bendEndMinValue;
                    break;
                case BendType.PrebendRelease:
                    renderPoints[0].lineValue = this._preBendMinValue;
                    value = note.isTieOrigin ? this._releaseContinuedMinValue : this._releaseMinValue;
                    if (value >= 0) {
                        renderPoints[1].lineValue = value;
                    }
                    break;
            }
        }
        this.width = 0;
        this._notes.sort((a, b) => {
            if (a.isStringed) {
                return a.string - b.string;
            }
            return a.realValue - b.realValue;
        });
    }

    private createRenderingPoints(note: Note): TabBendRenderPoint[] {
        let renderingPoints: TabBendRenderPoint[] = [];
        // Guitar Pro Rendering Note:
        // Last point of bend is always at end of the note even
        // though it might not be 100% correct from timing perspective.
        switch (note.bendType) {
            case BendType.Custom:
                for (let bendPoint of note.bendPoints) {
                    renderingPoints.push(new TabBendRenderPoint(bendPoint.offset, bendPoint.value));
                }
                break;
            case BendType.BendRelease:
                renderingPoints.push(new TabBendRenderPoint(0, note.bendPoints[0].value));
                renderingPoints.push(new TabBendRenderPoint((BendPoint.MaxPosition / 2) | 0, note.bendPoints[1].value));
                renderingPoints.push(new TabBendRenderPoint(BendPoint.MaxPosition, note.bendPoints[3].value));
                break;
            case BendType.Bend:
            case BendType.Hold:
            case BendType.Prebend:
            case BendType.PrebendBend:
            case BendType.PrebendRelease:
            case BendType.Release:
                renderingPoints.push(new TabBendRenderPoint(0, note.bendPoints[0].value));
                renderingPoints.push(new TabBendRenderPoint(BendPoint.MaxPosition, note.bendPoints[1].value));
                break;
        }
        return renderingPoints;
    }

    public paint(cx: number, cy: number, canvas: ICanvas): void {
        let color: Color = canvas.color;
        if (this._notes.length > 1) {
            canvas.color = this.renderer.resources.secondaryGlyphColor;
        }
        for (let note of this._notes) {
            let renderPoints: TabBendRenderPoint[] = this._renderPoints.get(note.id)!;
            let startNoteRenderer: BarRendererBase = this.renderer;
            let endNote: Note = note;
            let isMultiBeatBend: boolean = false;
            let endNoteRenderer: TabBarRenderer | null = null;
            let endNoteHasBend: boolean = false;
            let slurText: string = note.bendStyle === BendStyle.Gradual ? 'grad.' : '';
            let endBeat: Beat | null = null;
            while (endNote.isTieOrigin) {
                let nextNote: Note = endNote.tieDestination!;
                endNoteRenderer = this.renderer.scoreRenderer.layout!.getRendererForBar(
                    this.renderer.staff.staveId,
                    nextNote.beat.voice.bar
                ) as TabBarRenderer;
                if (!endNoteRenderer || startNoteRenderer.staff !== endNoteRenderer.staff) {
                    break;
                }
                endNote = nextNote;
                isMultiBeatBend = true;
                if (endNote.hasBend || !this.renderer.settings.notation.extendBendArrowsOnTiedNotes) {
                    endNoteHasBend = true;
                    break;
                }
            }
            endBeat = endNote.beat;
            endNoteRenderer = this.renderer.scoreRenderer.layout!.getRendererForBar(
                this.renderer.staff.staveId,
                endBeat.voice.bar
            ) as TabBarRenderer;
            if (
                endBeat.isLastOfVoice &&
                !endNote.hasBend &&
                this.renderer.settings.notation.extendBendArrowsOnTiedNotes
            ) {
                endBeat = null;
            }
            let startX: number = 0;
            let endX: number = 0;
            let topY: number = cy + startNoteRenderer.y;
            // float bottomY = cy + startNoteRenderer.Y + startNoteRenderer.GetNoteY(note);
            startX = cx + startNoteRenderer.x;
            if (renderPoints[0].value > 0 || note.isContinuedBend) {
                startX += startNoteRenderer.getBeatX(note.beat, BeatXPosition.MiddleNotes);
            } else {
                startX += startNoteRenderer.getNoteX(note, NoteXPosition.Right);
            }
            // canvas.Color = Color.Random();
            // canvas.FillRect(
            //    cx + startNoteRenderer.X + startNoteRenderer.GetBeatX(_note.Beat, BeatXPosition.MiddleNotes),
            //    cy + startNoteRenderer.Y, 10, 10);
            // canvas.FillRect(
            //    cx + startNoteRenderer.X + startNoteRenderer.GetBeatX(_note.Beat, BeatXPosition.EndBeat),
            //    cy + startNoteRenderer.Y + 10, 10, 10);
            if (!endBeat || (endBeat.isLastOfVoice && !endNoteHasBend)) {
                endX = cx + endNoteRenderer!.x + endNoteRenderer!.postBeatGlyphsStart;
            } else if (endNoteHasBend || !endBeat.nextBeat) {
                endX = cx + endNoteRenderer!.x + endNoteRenderer!.getBeatX(endBeat, BeatXPosition.MiddleNotes);
            } else if (note.bendType === BendType.Hold) {
                endX = cx + endNoteRenderer!.x + endNoteRenderer!.getBeatX(endBeat.nextBeat, BeatXPosition.OnNotes);
            } else {
                endX = cx + endNoteRenderer!.x + endNoteRenderer!.getBeatX(endBeat.nextBeat, BeatXPosition.PreNotes);
            }
            if (!isMultiBeatBend) {
                endX -= TabBendGlyph.ArrowSize * this.scale;
            }
            // we need some pixels for the arrow. otherwise we might draw into the next
            // note
            let width: number = endX - startX;
            // calculate offsets per step
            let dX: number = width / BendPoint.MaxPosition;
            canvas.beginPath();
            for (let i: number = 0, j: number = renderPoints.length - 1; i < j; i++) {
                let firstPt: TabBendRenderPoint = renderPoints[i];
                let secondPt: TabBendRenderPoint = renderPoints[i + 1];
                // draw pre-bend if previous
                if (i === 0 && firstPt.value !== 0 && !note.isTieDestination) {
                    this.paintBend(note, new TabBendRenderPoint(0, 0), firstPt, startX, topY, dX, slurText, canvas);
                }
                if (note.bendType !== BendType.Prebend) {
                    if (i === 0) {
                        startX += 2 * this.scale;
                    }
                    this.paintBend(note, firstPt, secondPt, startX, topY, dX, slurText, canvas);
                } else if (note.isTieOrigin && note.tieDestination!.hasBend) {
                    secondPt = new TabBendRenderPoint(BendPoint.MaxPosition, firstPt.value);
                    secondPt.lineValue = firstPt.lineValue;

                    this.paintBend(
                        note,
                        firstPt,
                        secondPt,
                        startX,
                        topY,
                        dX,
                        slurText,
                        canvas
                    );
                }
            }
            canvas.color = color;
        }
    }

    private paintBend(
        note: Note,
        firstPt: TabBendRenderPoint,
        secondPt: TabBendRenderPoint,
        cx: number,
        cy: number,
        dX: number,
        slurText: string,
        canvas: ICanvas
    ): void {
        let r: TabBarRenderer = this.renderer as TabBarRenderer;
        let res: RenderingResources = this.renderer.resources;
        let overflowOffset: number = r.lineOffset / 2;
        let x1: number = cx + dX * firstPt.offset;
        let bendValueHeight: number = TabBendGlyph.BendValueHeight * this.scale;
        let y1: number = cy - bendValueHeight * firstPt.lineValue;
        if (firstPt.value === 0) {
            if (secondPt.offset === firstPt.offset) {
                y1 += r.getNoteY(note.beat.maxStringNote!, NoteYPosition.Top);
            } else {
                y1 += r.getNoteY(note, NoteYPosition.Center);
            }
        } else {
            y1 += overflowOffset;
        }
        let x2: number = cx + dX * secondPt.offset;
        let y2: number = cy - bendValueHeight * secondPt.lineValue;
        if (secondPt.lineValue === 0) {
            y2 += r.getNoteY(note, NoteYPosition.Center);
        } else {
            y2 += overflowOffset;
        }
        // what type of arrow? (up/down)
        let arrowOffset: number = 0;
        let arrowSize: number = TabBendGlyph.ArrowSize * this.scale;
        if (secondPt.value > firstPt.value) {
            if (y2 + arrowSize > y1) {
                y2 = y1 - arrowSize;
            }
            canvas.beginPath();
            canvas.moveTo(x2, y2);
            canvas.lineTo(x2 - arrowSize * 0.5, y2 + arrowSize);
            canvas.lineTo(x2 + arrowSize * 0.5, y2 + arrowSize);
            canvas.closePath();
            canvas.fill();
            arrowOffset = arrowSize;
        } else if (secondPt.value !== firstPt.value) {
            if (y2 < y1) {
                y2 = y1 + arrowSize;
            }
            canvas.beginPath();
            canvas.moveTo(x2, y2);
            canvas.lineTo(x2 - arrowSize * 0.5, y2 - arrowSize);
            canvas.lineTo(x2 + arrowSize * 0.5, y2 - arrowSize);
            canvas.closePath();
            canvas.fill();
            arrowOffset = -arrowSize;
        }
        canvas.stroke();
        if (firstPt.value === secondPt.value) {
            // draw horizontal dashed line
            // to really have the line ending at the right position
            // we draw from right to left. it's okay if the space is at the beginning
            if (firstPt.lineValue > 0) {
                let dashX: number = x2;
                let dashSize: number = TabBendGlyph.DashSize * this.scale;
                let end: number = x1 + dashSize;
                let dashes: number = (dashX - x1) / (dashSize * 2);
                if (dashes < 1) {
                    canvas.moveTo(dashX, y1);
                    canvas.lineTo(x1, y1);
                } else {
                    while (dashX > end) {
                        canvas.moveTo(dashX, y1);
                        canvas.lineTo(dashX - dashSize, y1);
                        dashX -= dashSize * 2;
                    }
                }
                canvas.stroke();
            }
        } else {
            if (x2 > x1) {
                // draw bezier lien from first to second point
                canvas.moveTo(x1, y1);
                canvas.bezierCurveTo((x1 + x2) / 2, y1, x2, y1, x2, y2 + arrowOffset);
                canvas.stroke();
            } else {
                canvas.moveTo(x1, y1);
                canvas.lineTo(x2, y2);
                canvas.stroke();
            }
        }
        if (slurText && firstPt.offset < secondPt.offset) {
            canvas.font = res.graceFont;
            let size: number = canvas.measureText(slurText);
            let y: number = 0;
            let x: number = 0;
            if (y1 > y2) {
                let h: number = Math.abs(y1 - y2);
                y = h > canvas.font.size * 1.3 ? y1 - h / 2 : y1;
                x = (x1 + x2 - size) / 2;
            } else {
                y = y1;
                x = x2 - size;
            }
            canvas.fillText(slurText, x, y);
        }
        if (secondPt.value !== 0 && firstPt.value !== secondPt.value) {
            let dV: number = secondPt.value;
            let up: boolean = secondPt.value > firstPt.value;
            dV = Math.abs(dV);
            // calculate label
            let s: string = '';
            // Full Steps
            if (dV === 4) {
                s = 'full';
                dV -= 4;
            } else if (dV >= 4 || dV <= -4) {
                let steps: number = (dV / 4) | 0;
                s += steps;
                // Quaters
                dV -= steps * 4;
            }
            if (dV > 0) {
                s += TabBendGlyph.getFractionSign(dV);
            }
            if (s !== '') {
                y2 = cy - bendValueHeight * secondPt.value;
                let startY: number = y2;
                if (!up) {
                    startY = y1 + (Math.abs(y2 - y1) * 1) / 3;
                }
                // draw label
                canvas.font = res.tablatureFont;
                let size: number = canvas.measureText(s);
                let y: number = startY - res.tablatureFont.size * 0.5 - 2 * this.scale;
                let x: number = x2 - size / 2;
                canvas.fillText(s, x, y);
            }
        }
    }

    public static getFractionSign(steps: number): string {
        switch (steps) {
            case 1:
                return '¼';
            case 2:
                return '½';
            case 3:
                return '¾';
            default:
                return steps + '/ 4';
        }
    }
}
