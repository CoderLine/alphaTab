import { Beat } from '@src/model/Beat';
import { ICanvas } from '@src/platform/ICanvas';
import { BarRendererBase } from '@src/rendering/BarRendererBase';
import { Glyph } from '@src/rendering/glyphs/Glyph';
import { BeamDirection } from '@src/rendering/utils/BeamDirection';
import { Bounds } from '../utils/Bounds';

export class TieGlyph extends Glyph {
    protected startBeat: Beat | null;
    protected endBeat: Beat | null;
    protected yOffset: number = 0;
    protected forEnd: boolean;

    protected startNoteRenderer: BarRendererBase | null = null;
    protected endNoteRenderer: BarRendererBase | null = null;
    protected tieDirection: BeamDirection = BeamDirection.Up;

    public constructor(startBeat: Beat | null, endBeat: Beat | null, forEnd: boolean) {
        super(0, 0);
        this.startBeat = startBeat;
        this.endBeat = endBeat;
        this.forEnd = forEnd;
    }

    private _startX: number = 0;
    private _startY: number = 0;
    private _endX: number = 0;
    private _endY: number = 0;
    private _tieHeight: number = 0;
    private _shouldDraw: boolean = false;

    public override doLayout(): void {
        this.width = 0;
        // TODO fix nullability of start/end beat,
        if (!this.endBeat) {
            this._shouldDraw = false;
            return;
        }

        let startNoteRenderer = this.renderer.scoreRenderer.layout!.getRendererForBar(
            this.renderer.staff.staveId,
            this.startBeat!.voice.bar
        );
        this.startNoteRenderer = startNoteRenderer;
        let endNoteRenderer = this.renderer.scoreRenderer.layout!.getRendererForBar(
            this.renderer.staff.staveId,
            this.endBeat.voice.bar
        );
        this.endNoteRenderer = endNoteRenderer;

        this._startX = 0;
        this._endX = 0;
        this._startY = 0;
        this._endY = 0;
        this.height = 0;
        this._shouldDraw = false;
        // if we are on the tie start, we check if we
        // either can draw till the end note, or we just can draw till the bar end
        this.tieDirection = !startNoteRenderer
            ? this.getBeamDirection(this.endBeat, endNoteRenderer!)
            : this.getBeamDirection(this.startBeat!, startNoteRenderer);
        if (!this.forEnd && startNoteRenderer) {
            // line break or bar break
            if (startNoteRenderer !== endNoteRenderer) {
                this._startX = startNoteRenderer.x + this.getStartX();
                this._startY = startNoteRenderer.y + this.getStartY() + this.yOffset;
                // line break: to bar end
                if (!endNoteRenderer || startNoteRenderer.staff !== endNoteRenderer.staff) {
                    this._endX = startNoteRenderer.x + startNoteRenderer.width;
                    this._endY = this._startY;
                } else {
                    this._endX = endNoteRenderer.x + this.getEndX();
                    this._endY = endNoteRenderer.y + this.getEndY() + this.yOffset;
                }
            } else {
                this._startX = startNoteRenderer.x + this.getStartX();
                this._endX = endNoteRenderer.x + this.getEndX();
                this._startY = startNoteRenderer.y + this.getStartY() + this.yOffset;
                this._endY = endNoteRenderer.y + this.getEndY() + this.yOffset;
            }
            this._shouldDraw = true;
        } else if (!startNoteRenderer || startNoteRenderer.staff !== endNoteRenderer!.staff) {
            this._startX = endNoteRenderer!.x;
            this._endX = endNoteRenderer!.x + this.getEndX();
            this._startY = endNoteRenderer!.y + this.getEndY() + this.yOffset;
            this._endY = this._startY;
            this._shouldDraw = true;
        }

        if (this._shouldDraw) {
            this.y = Math.min(this._startY, this._endY);
            if (this.shouldDrawBendSlur()) {
                this._tieHeight = 0; // TODO: Bend slur height to be considered?
            } else {
                this._tieHeight = this.getTieHeight(this._startX, this._startY, this._endX, this._endY);
                this.height = TieGlyph.calculateActualTieHeight(
                    this.renderer.scale,
                    this._startX,
                    this._startY,
                    this._endX,
                    this._endY,
                    this.tieDirection === BeamDirection.Down,
                    this._tieHeight,
                    4
                ).h;
            }

            if (this.tieDirection === BeamDirection.Up) {
                this.y -= this.height;
            }
        }
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        if (this._shouldDraw) {
            if (this.shouldDrawBendSlur()) {
                TieGlyph.drawBendSlur(
                    canvas,
                    cx + this._startX,
                    cy + this._startY,
                    cx + this._endX,
                    cy + this._endY,
                    this.tieDirection === BeamDirection.Down,
                    this.scale
                );
            } else {
                TieGlyph.paintTie(
                    canvas,
                    this.scale,
                    cx + this._startX,
                    cy + this._startY,
                    cx + this._endX,
                    cy + this._endY,
                    this.tieDirection === BeamDirection.Down,
                    this._tieHeight,
                    4
                );
            }
        }
    }

    protected shouldDrawBendSlur() {
        return false;
    }

    protected getTieHeight(startX: number, startY: number, endX: number, endY: number): number {
        return 22;
    }

    protected getBeamDirection(beat: Beat, noteRenderer: BarRendererBase): BeamDirection {
        return BeamDirection.Down;
    }

    protected getStartY(): number {
        return 0;
    }

    protected getEndY(): number {
        return 0;
    }

    protected getStartX(): number {
        return 0;
    }

    protected getEndX(): number {
        return 0;
    }

    public static calculateActualTieHeight(
        scale: number,
        x1: number,
        y1: number,
        x2: number,
        y2: number,
        down: boolean,
        offset: number,
        size: number
    ): Bounds {
        const cp = TieGlyph.computeBezierControlPoints(scale, x1, y1, x2, y2, down, offset, size);

        x1 = cp[0];
        y1 = cp[1];
        const cpx = cp[2];
        const cpy = cp[3];
        x2 = cp[6];
        y2 = cp[7];

        const tx = (x1 - cpx) / (x1 - 2 * cpx + x2);
        const ex = TieGlyph.calculateExtrema(x1, y1, cpx, cpy, x2, y2, tx);
        const xMin = ex.length > 0 ? Math.min(x1, x2, ex[0]) : Math.min(x1, x2);
        const xMax = ex.length > 0 ? Math.max(x1, x2, ex[0]) : Math.max(x1, x2);

        const ty = (y1 - cpy) / (y1 - 2 * cpy + y2);
        const ey = TieGlyph.calculateExtrema(x1, y1, cpx, cpy, x2, y2, ty);
        const yMin = ey.length > 0 ? Math.min(y1, y2, ey[1]) : Math.min(y1, y2);
        const yMax = ey.length > 0 ? Math.max(y1, y2, ey[1]) : Math.max(y1, y2);

        const b = new Bounds();
        b.x = xMin;
        b.y = yMin;
        b.w = xMax - xMin;
        b.h = yMax - yMin;
        return b;
    }

    private static calculateExtrema(
        x1: number,
        y1: number,
        cpx: number,
        cpy: number,
        x2: number,
        y2: number,
        t: number
    ): number[] {
        if (t <= 0 || 1 <= t) {
            return [];
        }

        const c1x = x1 + (cpx - x1) * t;
        const c1y = y1 + (cpy - y1) * t;

        const c2x = cpx + (x2 - cpx) * t;
        const c2y = cpy + (y2 - cpy) * t;

        return [c1x + (c2x - c1x) * t, c1y + (c2y - c1y) * t];
    }

    private static computeBezierControlPoints(
        scale: number,
        x1: number,
        y1: number,
        x2: number,
        y2: number,
        down: boolean,
        offset: number,
        size: number
    ): number[] {
        if (x1 === x2 && y1 === y2) {
            return [];
        }

        // ensure endX > startX
        if (x2 < x1) {
            let t: number = x1;
            x1 = x2;
            x2 = t;
            t = y1;
            y1 = y2;
            y2 = t;
        }

        //
        // calculate control points
        //
        offset *= scale;
        size *= scale;
        // normal vector
        let normalVectorX: number = y2 - y1;
        let normalVectorY: number = x2 - x1;
        let length: number = Math.sqrt(normalVectorX * normalVectorX + normalVectorY * normalVectorY);
        if (down) {
            normalVectorX *= -1;
        } else {
            normalVectorY *= -1;
        }
        // make to unit vector
        normalVectorX /= length;
        normalVectorY /= length;
        // center of connection
        let centerX: number = (x2 + x1) / 2;
        let centerY: number = (y2 + y1) / 2;
        // control points
        let cp1X: number = centerX + offset * normalVectorX;
        let cp1Y: number = centerY + offset * normalVectorY;
        let cp2X: number = centerX + (offset - size) * normalVectorX;
        let cp2Y: number = centerY + (offset - size) * normalVectorY;

        return [x1, y1, cp1X, cp1Y, cp2X, cp2Y, x2, y2];
    }

    public static paintTie(
        canvas: ICanvas,
        scale: number,
        x1: number,
        y1: number,
        x2: number,
        y2: number,
        down: boolean = false,
        offset: number = 22,
        size: number = 4
    ): void {
        const cps = TieGlyph.computeBezierControlPoints(scale, x1, y1, x2, y2, down, offset, size);

        canvas.beginPath();
        canvas.moveTo(cps[0], cps[1]);
        canvas.quadraticCurveTo(cps[2], cps[3], cps[6], cps[7]);
        canvas.quadraticCurveTo(cps[4], cps[5], cps[0], cps[1]);
        canvas.closePath();
        canvas.fill();

        // const c = canvas.color;
        // canvas.color = Color.random(100);
        // canvas.fillCircle(cps[0], cps[1], 4);
        // canvas.fillCircle(cps[2], cps[3], 4);
        // canvas.fillCircle(cps[4], cps[5], 4);
        // canvas.fillCircle(cps[7], cps[6], 4);

        // canvas.color = Color.random(100);

        // const bbox = TieGlyph.calculateActualTieHeight(scale, x1, y1, x2, y2, down, offset, size);

        // canvas.fillRect(bbox.x, bbox.y, bbox.w, bbox.h);

        // canvas.color = c;
    }

    private static readonly BendSlurHeight: number = 11;

    public static drawBendSlur(
        canvas: ICanvas,
        x1: number,
        y1: number,
        x2: number,
        y2: number,
        down: boolean,
        scale: number,
        slurText?: string
    ): void {
        let normalVectorX: number = y2 - y1;
        let normalVectorY: number = x2 - x1;
        let length: number = Math.sqrt(normalVectorX * normalVectorX + normalVectorY * normalVectorY);
        if (down) {
            normalVectorX *= -1;
        } else {
            normalVectorY *= -1;
        }
        // make to unit vector
        normalVectorX /= length;
        normalVectorY /= length;
        // center of connection
        // TODO: should be 1/3
        let centerX: number = (x2 + x1) / 2;
        let centerY: number = (y2 + y1) / 2;
        let offset: number = TieGlyph.BendSlurHeight * scale;
        if (x2 - x1 < 20) {
            offset /= 2;
        }
        let cp1X: number = centerX + offset * normalVectorX;
        let cp1Y: number = centerY + offset * normalVectorY;
        canvas.beginPath();
        canvas.moveTo(x1, y1);
        canvas.lineTo(cp1X, cp1Y);
        canvas.lineTo(x2, y2);
        canvas.stroke();
        if (slurText) {
            let w: number = canvas.measureText(slurText);
            let textOffset: number = down ? 0 : -canvas.font.size;
            canvas.fillText(slurText, cp1X - w / 2, cp1Y + textOffset);
        }
    }
}
