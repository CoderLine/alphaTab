import type { Beat } from '@coderline/alphatab/model/Beat';
import type { ICanvas } from '@coderline/alphatab/platform/ICanvas';
import type { BarRendererBase } from '@coderline/alphatab/rendering/BarRendererBase';
import { Glyph } from '@coderline/alphatab/rendering/glyphs/Glyph';
import { BeamDirection } from '@coderline/alphatab/rendering/utils/BeamDirection';
import { Bounds } from '@coderline/alphatab/rendering/utils/Bounds';

/**
 * @internal
 */
export interface ITieGlyph {
    /**
     * Whether the tie is relevant for checking on bar renderer overflows.
     * If set, the tie bounds will be requested and the overflow is applied.
     */
    readonly checkForOverflow: boolean;
}

/**
 * @internal
 */
export class TieGlyph extends Glyph implements ITieGlyph {
    protected startBeat: Beat;
    protected endBeat: Beat;
    protected yOffset: number = 0;

    protected startNoteRenderer: BarRendererBase | null = null;
    protected endNoteRenderer: BarRendererBase | null = null;
    protected tieDirection: BeamDirection = BeamDirection.Up;

    public constructor(startBeat: Beat, endBeat: Beat) {
        super(0, 0);
        this.startBeat = startBeat;
        this.endBeat = endBeat;
    }

    private _startX: number = 0;
    private _startY: number = 0;
    private _endX: number = 0;
    private _endY: number = 0;
    private _tieHeight: number = 0;
    private _boundingBox?: Bounds;

    public get checkForOverflow() {
        return this._boundingBox !== undefined;
    }

    public override getBoundingBoxTop(): number {
        if (this._boundingBox) {
            return this._boundingBox!.y;
        }
        return this._startY;
    }

    public override getBoundingBoxBottom(): number {
        if (this._boundingBox) {
            return this._boundingBox.y + this._boundingBox.h;
        }
        return this._startY;
    }

    public override doLayout(): void {
        this.width = 0;
        // TODO fix nullability of start/end beat,
        if (!this.endBeat) {
            return;
        }

        const startNoteRenderer = this.renderer;
        this.startNoteRenderer = startNoteRenderer;
        const endNoteRenderer = this.renderer.scoreRenderer.layout!.getRendererForBar(
            this.renderer.staff.staffId,
            this.endBeat.voice.bar
        );
        this.endNoteRenderer = endNoteRenderer;

        this._startX = 0;
        this._endX = 0;
        this._startY = 0;
        this._endY = 0;
        this.height = 0;
        // if we are on the tie start, we check if we
        // either can draw till the end note, or we just can draw till the bar end
        this.tieDirection = !startNoteRenderer
            ? this.getBeamDirection(this.endBeat, endNoteRenderer!)
            : this.getBeamDirection(this.startBeat!, startNoteRenderer);

        // line break or bar break
        if (startNoteRenderer !== endNoteRenderer) {
            this._startX = startNoteRenderer.x + this.getStartX();
            this._startY = startNoteRenderer.y + this.getStartY() + this.yOffset;
            // line break: to bar end
            if (!endNoteRenderer || startNoteRenderer.staff !== endNoteRenderer.staff) {
                const lastRendererInStaff =
                    startNoteRenderer.staff.barRenderers[startNoteRenderer.staff.barRenderers.length - 1];

                this._endX = lastRendererInStaff.x + lastRendererInStaff.width;
                this._endY = this._startY;

                startNoteRenderer.scoreRenderer.layout!.slurRegistry.startMultiSystemSlur(this);
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

        this._boundingBox = undefined;
        this.y = Math.min(this._startY, this._endY);
        if (this.shouldDrawBendSlur()) {
            this._tieHeight = 0; // TODO: Bend slur height to be considered?
        } else {
            this._tieHeight = this.getTieHeight(this._startX, this._startY, this._endX, this._endY);

            const tieBoundingBox = TieGlyph.calculateActualTieHeight(
                1,
                this._startX,
                this._startY,
                this._endX,
                this._endY,
                this.tieDirection === BeamDirection.Down,
                this._tieHeight,
                this.renderer.smuflMetrics.tieMidpointThickness
            );
            this._boundingBox = tieBoundingBox;

            this.height = tieBoundingBox.h;

            if (this.tieDirection === BeamDirection.Up) {
                // the tie might go above `this.y` due to its shape
                // here we calculate how much this is so we can consider the
                // respective overflow
                const overlap = this.y - tieBoundingBox.y;
                if (overlap > 0) {
                    this.y -= overlap;
                }
            }
        }
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        if (this.shouldDrawBendSlur()) {
            TieGlyph.drawBendSlur(
                canvas,
                cx + this._startX,
                cy + this._startY,
                cx + this._endX,
                cy + this._endY,
                this.tieDirection === BeamDirection.Down,
                1,
                this.renderer.smuflMetrics.tieHeight
            );
        } else {
            TieGlyph.paintTie(
                canvas,
                1,
                cx + this._startX,
                cy + this._startY,
                cx + this._endX,
                cy + this._endY,
                this.tieDirection === BeamDirection.Down,
                this._tieHeight,
                this.renderer.smuflMetrics.tieMidpointThickness
            );
        }
    }

    protected shouldDrawBendSlur() {
        return false;
    }

    protected getTieHeight(_startX: number, _startY: number, _endX: number, _endY: number): number {
        return this.renderer.smuflMetrics.tieHeight;
    }

    protected getBeamDirection(_beat: Beat, _noteRenderer: BarRendererBase): BeamDirection {
        return BeamDirection.Down;
    }

    protected getStartY(): number {
        return 0;
    }

    protected getStartLine(): number {
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
        const cp = TieGlyph._computeBezierControlPoints(scale, x1, y1, x2, y2, down, offset, size);

        // For a musical tie/slur, the extrema occur predictably near the midpoint
        // Evaluate at midpoint (t=0.5) and check endpoints
        const p0x = cp[0];
        const p0y = cp[1];
        const c1x = cp[2];
        const c1y = cp[3];
        const c2x = cp[4];
        const c2y = cp[5];
        const p1x = cp[6];
        const p1y = cp[7];

        // Evaluate at t=0.5 for midpoint
        const midX = 0.125 * p0x + 0.375 * c1x + 0.375 * c2x + 0.125 * p1x;
        const midY = 0.125 * p0y + 0.375 * c1y + 0.375 * c2y + 0.125 * p1y;

        // Bounds are simply min/max of start, end, and midpoint
        const xMin = Math.min(p0x, p1x, midX);
        const xMax = Math.max(p0x, p1x, midX);
        let yMin = Math.min(p0y, p1y, midY);
        let yMax = Math.max(p0y, p1y, midY);

        // Account for thickness of the tie/slur
        if (down) {
            yMax += size;
        } else {
            yMin -= size;
        }

        const b = new Bounds();
        b.x = xMin;
        b.y = yMin;
        b.w = xMax - xMin;
        b.h = yMax - yMin;
        return b;
    }

    private static _computeBezierControlPoints(
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

        if (down) {
            offset *= -1;
            size *= -1;
        }

        if (scale >= 1) {
            size *= 1.2;
        }

        // calculate control points on horizontal axis then rotate:
        /*
              cp1x/cpy1                  cp2x/cpy2
                      *----------------*
                     /                  \
                    /                    \
            x1/y1  *                      * x2/y2

            cp3 and cp4 are simply with lower height
         */

        const dY = y2 - y1;
        const dX = x2 - x1;
        const length = Math.sqrt(dX * dX + dY * dY);

        let cp1x = x1 + length * 0.25;
        let cp1y = y1 - offset;

        let cp2x = x1 + length * 0.75;
        let cp2y = y1 - offset;

        let cp3x = x1 + length * 0.75;
        let cp3y = y1 - offset - size;

        let cp4x = x1 + length * 0.25;
        let cp4y = y1 - offset - size;

        const angle = Math.atan2(dY, dX);

        [cp1x, cp1y] = TieGlyph._rotate(cp1x, cp1y, x1, y1, angle);
        [cp2x, cp2y] = TieGlyph._rotate(cp2x, cp2y, x1, y1, angle);
        [cp3x, cp3y] = TieGlyph._rotate(cp3x, cp3y, x1, y1, angle);
        [cp4x, cp4y] = TieGlyph._rotate(cp4x, cp4y, x1, y1, angle);

        return [x1, y1, cp1x, cp1y, cp2x, cp2y, x2, y2, cp3x, cp3y, cp4x, cp4y, x1, y1];
    }

    private static _rotate(x: number, y: number, rotateX: number, rotateY: number, angle: number): [number, number] {
        const dx = x - rotateX;
        const dy = y - rotateY;
        const rx = dx * Math.cos(angle) - dy * Math.sin(angle);
        const ry = dx * Math.sin(angle) + dy * Math.cos(angle);
        return [rotateX + rx, rotateY + ry];
    }

    public static paintTie(
        canvas: ICanvas,
        scale: number,
        x1: number,
        y1: number,
        x2: number,
        y2: number,
        down: boolean /*= false*/,
        offset: number /*= 22*/,
        size: number /*= 4*/
    ): void {
        const cps = TieGlyph._computeBezierControlPoints(scale, x1, y1, x2, y2, down, offset, size);

        canvas.beginPath();
        canvas.moveTo(cps[0], cps[1]);
        canvas.bezierCurveTo(cps[2], cps[3], cps[4], cps[5], cps[6], cps[7]);
        canvas.bezierCurveTo(cps[8], cps[9], cps[10], cps[11], cps[12], cps[13]);
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

    public static calculateBendSlurTopY(
        x1: number,
        y1: number,
        x2: number,
        y2: number,
        down: boolean,
        scale: number,
        bendSlurHeight: number
    ) {
        let normalVectorX: number = y2 - y1;
        let normalVectorY: number = x2 - x1;
        const length: number = Math.sqrt(normalVectorX * normalVectorX + normalVectorY * normalVectorY);
        if (down) {
            normalVectorX *= -1;
        } else {
            normalVectorY *= -1;
        }
        // make to unit vector
        normalVectorX /= length;
        normalVectorY /= length;

        let offset: number = bendSlurHeight * scale;
        if (x2 - x1 < 20) {
            offset /= 2;
        }
        const centerY: number = (y2 + y1) / 2;
        const cp1Y: number = centerY + offset * normalVectorY;

        return cp1Y;
    }

    public static drawBendSlur(
        canvas: ICanvas,
        x1: number,
        y1: number,
        x2: number,
        y2: number,
        down: boolean,
        scale: number,
        bendSlurHeight: number,
        slurText?: string
    ): void {
        let normalVectorX: number = y2 - y1;
        let normalVectorY: number = x2 - x1;
        const length: number = Math.sqrt(normalVectorX * normalVectorX + normalVectorY * normalVectorY);
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
        const centerX: number = (x2 + x1) / 2;
        const centerY: number = (y2 + y1) / 2;
        let offset: number = bendSlurHeight * scale;
        if (x2 - x1 < 20) {
            offset /= 2;
        }
        const cp1X: number = centerX + offset * normalVectorX;
        const cp1Y: number = centerY + offset * normalVectorY;
        canvas.beginPath();
        canvas.moveTo(x1, y1);
        canvas.lineTo(cp1X, cp1Y);
        canvas.lineTo(x2, y2);
        canvas.stroke();
        if (slurText) {
            const w: number = canvas.measureText(slurText).width;
            const textOffset: number = down ? 0 : -canvas.font.size;
            canvas.fillText(slurText, cp1X - w / 2, cp1Y + textOffset);
        }
    }
}
