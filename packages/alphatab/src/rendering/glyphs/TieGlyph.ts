import type { Note } from '@coderline/alphatab/model/Note';
import type { ICanvas } from '@coderline/alphatab/platform/ICanvas';
import { type BarRendererBase, NoteXPosition, NoteYPosition } from '@coderline/alphatab/rendering/BarRendererBase';
import { Glyph } from '@coderline/alphatab/rendering/glyphs/Glyph';
import type { LineBarRenderer } from '@coderline/alphatab/rendering/LineBarRenderer';
import type { SkylineShape } from '@coderline/alphatab/rendering/skyline/SkylineShape';
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
    /**
     * Whether {@link collectSkylineShape} describes the drawn extent, used for the skyline instead of
     * the bounding box (which then only sizes the overflow).
     */
    readonly hasSkylineShape: boolean;
    /**
     * Adds the drawn extent to the shape, staff-local x and renderer-local y like the bounding box.
     * Only valid once the beats are positioned.
     */
    collectSkylineShape(shape: SkylineShape): void;
    getBoundingBoxTop(): number;
    getBoundingBoxBottom(): number;
    getBoundingBoxLeft(): number;
    getBoundingBoxRight(): number;
}

/**
 * @internal
 */
export abstract class TieGlyph extends Glyph implements ITieGlyph {
    public readonly hasSkylineShape: boolean = false;
    public tieDirection: BeamDirection = BeamDirection.Up;
    public readonly slurEffectId: string;
    protected isForEnd: boolean;

    public constructor(slurEffectId: string, forEnd: boolean) {
        super(0, 0);
        this.slurEffectId = slurEffectId;
        this.isForEnd = forEnd;
    }

    private _startX: number = 0;
    private _startY: number = 0;
    private _endX: number = 0;
    private _endY: number = 0;
    private _tieHeight: number = 0;
    private _hasBoundingBox: boolean = false;
    private _boundingBoxX: number = 0;
    private _boundingBoxY: number = 0;
    private _boundingBoxW: number = 0;
    private _boundingBoxH: number = 0;
    private _shouldPaint: boolean = false;

    public collectSkylineShape(_shape: SkylineShape): void {
        // the bounding box describes a tie closely enough
    }

    public get checkForOverflow() {
        return this._shouldPaint && this._hasBoundingBox;
    }

    /** Renderer-local Y. Staff finalize may shift `renderer.y` after tie layout, so geometry stays renderer-relative. */
    public override getBoundingBoxTop(): number {
        if (this._hasBoundingBox) {
            return this._boundingBoxY;
        }
        return this._startY;
    }

    public override getBoundingBoxBottom(): number {
        if (this._hasBoundingBox) {
            return this._boundingBoxY + this._boundingBoxH;
        }
        return this._startY;
    }

    /** Staff-absolute X — `_startX`/`_endX` bake in their renderers' `.x` for cross-bar ties. */
    public override getBoundingBoxLeft(): number {
        if (this._hasBoundingBox) {
            return this._boundingBoxX;
        }
        return this._startX;
    }

    public override getBoundingBoxRight(): number {
        if (this._hasBoundingBox) {
            return this._boundingBoxX + this._boundingBoxW;
        }
        return this._endX;
    }

    public override doLayout(): void {
        this.width = 0;

        const startNoteRenderer = this.lookupStartBeatRenderer();
        const endNoteRenderer = this.lookupEndBeatRenderer();

        this._startX = 0;
        this._endX = 0;
        this._startY = 0;
        this._endY = 0;
        this.height = 0;
        // if we are on the tie start, we check if we
        // either can draw till the end note, or we just can draw till the bar end
        this.tieDirection = this.calculateTieDirection();

        const forEnd = this.isForEnd;
        this._shouldPaint = false;

        if (!forEnd) {
            if (startNoteRenderer !== endNoteRenderer) {
                this._startX = this.calculateStartX();
                this._startY = this.calculateStartY();
                if (!endNoteRenderer || startNoteRenderer.staff !== endNoteRenderer.staff) {
                    const lastRendererInStaff =
                        startNoteRenderer.staff!.barRenderers[startNoteRenderer.staff!.barRenderers.length - 1];

                    this._endX = lastRendererInStaff.x + lastRendererInStaff.width;
                    this._endY = this._startY;

                    startNoteRenderer.scoreRenderer.layout!.slurRegistry.startMultiSystemSlur(this);
                } else {
                    this._endX = this.calculateEndX();
                    this._endY = this.caclculateEndY();
                    this._ensureMinimumSpan();
                }
            } else {
                this._shouldPaint = true;
                this._startX = this.calculateStartX();
                this._endX = this.calculateEndX();
                this._startY = this.calculateStartY();
                this._endY = this.caclculateEndY();
                this._ensureMinimumSpan();
            }
            this._shouldPaint = true;
        } else if (startNoteRenderer.staff !== endNoteRenderer!.staff) {
            // continued tie/slur on a new system: start after the clef and
            // key/time signatures instead of the very left edge of the staff.
            // ties ending on the first beat can have their end sitting directly
            // at the start of the beat area, keep a minimum length so the
            // continuation curve stays visible in this case.
            const firstRendererInStaff = endNoteRenderer!.staff!.barRenderers[0];
            // padding to shift ties clearly before the first note (slight visual tuning)
            const padding = 2 * firstRendererInStaff!.smuflMetrics.oneStaffSpace;
            this._endX = this.calculateEndX();
            this._startX =
                Math.min(firstRendererInStaff!.x + firstRendererInStaff!.beatGlyphsStart, this._endX) - padding;

            const startGlyph = startNoteRenderer.scoreRenderer.layout!.slurRegistry.completeMultiSystemSlur(this);
            if (startGlyph) {
                this._startY = startGlyph.calculateMultiSystemSlurY(endNoteRenderer!);
            } else {
                this._startY = this.caclculateEndY();
            }

            this._endY = this.caclculateEndY();

            this._shouldPaint = startNoteRenderer.staff !== endNoteRenderer!.staff;
        }

        this._hasBoundingBox = false;
        this.y = Math.min(this._startY, this._endY);
        const down = this.tieDirection === BeamDirection.Down;
        if (this.shouldDrawBendSlur()) {
            this._tieHeight = 0;
            const bendBoundingBox = TieGlyph.calculateBendSlurHeight(
                this._startX,
                this._startY,
                this._endX,
                this._endY,
                down,
                this.renderer.smuflMetrics.tieHeight
            );
            this._boundingBoxX = bendBoundingBox.x;
            this._boundingBoxY = bendBoundingBox.y;
            this._boundingBoxW = bendBoundingBox.w;
            this._boundingBoxH = bendBoundingBox.h;
        } else {
            this._tieHeight = this.getTieHeight(this._startX, this._startY, this._endX, this._endY);
            const tieThickness = this.renderer.smuflMetrics.tieMidpointThickness;
            const cps = this.renderer.scoreRenderer.layout!.tieControlPoints;
            if (
                TieGlyph._computeBezierControlPoints(
                    cps,
                    1,
                    this._startX,
                    this._startY,
                    this._endX,
                    this._endY,
                    down,
                    this._tieHeight,
                    tieThickness
                )
            ) {
                this._setBoundingBoxFromCps(cps, down, tieThickness);
            } else {
                this._boundingBoxX = this._startX;
                this._boundingBoxY = this._startY;
                this._boundingBoxW = this._endX - this._startX;
                this._boundingBoxH = this._endY - this._startY;
            }
        }

        this._hasBoundingBox = true;
        this.height = this._boundingBoxH;

        if (this.tieDirection === BeamDirection.Up) {
            // the tie might go above `this.y` due to its shape
            // here we calculate how much this is so we can consider the
            // respective overflow
            const overlap = this.y - this._boundingBoxY;
            if (overlap > 0) {
                this.y -= overlap;
            }
        }
    }

    /**
     * Keeps ties and slurs at least as long as the padding the spacing keeps between beats. Only bars
     * squeezed below their minimum width (overlapping content) can bring the anchors closer than this or
     * even reverse their order, which would otherwise produce degenerated or inverted curves.
     */
    private _ensureMinimumSpan(): void {
        const minSpan = this.renderer.smuflMetrics.beatContentPadding;
        if (this._endX - this._startX < minSpan) {
            const center = (this._startX + this._endX) / 2;
            this._startX = center - minSpan / 2;
            this._endX = center + minSpan / 2;
        }
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        if (!this._shouldPaint) {
            return;
        }

        // Tie Y is renderer-local; resolve `renderer.y` at paint time.
        const rendererY = this.renderer.y;

        const isDown = this.tieDirection === BeamDirection.Down;

        if (this.shouldDrawBendSlur()) {
            TieGlyph.drawBendSlur(
                canvas,
                cx + this._startX,
                cy + rendererY + this._startY,
                cx + this._endX,
                cy + rendererY + this._endY,
                isDown,
                this.renderer.smuflMetrics.tieHeight
            );
        } else {
            TieGlyph.paintTie(
                canvas,
                1,
                cx + this._startX,
                cy + rendererY + this._startY,
                cx + this._endX,
                cy + rendererY + this._endY,
                isDown,
                this._tieHeight,
                this.renderer.smuflMetrics.tieMidpointThickness
            );
        }
    }

    protected abstract shouldDrawBendSlur(): boolean;

    public getTieHeight(_startX: number, _startY: number, _endX: number, _endY: number): number {
        return this.renderer.smuflMetrics.tieHeight;
    }

    protected abstract calculateTieDirection(): BeamDirection;

    protected abstract lookupStartBeatRenderer(): LineBarRenderer;
    protected abstract lookupEndBeatRenderer(): LineBarRenderer | null;

    protected abstract calculateStartY(): number;

    protected abstract caclculateEndY(): number;

    protected abstract calculateStartX(): number;

    protected abstract calculateEndX(): number;

    public calculateMultiSystemSlurY(_renderer: BarRendererBase) {
        return this.calculateStartY();
    }

    public shouldCreateMultiSystemSlur(renderer: BarRendererBase) {
        const endStaff = this.lookupEndBeatRenderer()?.staff;
        if (!endStaff) {
            return true;
        }

        return renderer.staff!.system.index < endStaff.system.index;
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
        const cp = TieGlyph.newControlPoints();
        if (!TieGlyph._computeBezierControlPoints(cp, scale, x1, y1, x2, y2, down, offset, size)) {
            return new Bounds(x1, y1, x2 - x1, y2 - y1);
        }
        TieGlyph._calculateBoundingBoxFromCps(cp, down, size);
        return new Bounds(cp[14], cp[15], cp[16], cp[17]);
    }

    /**
     * Creates the scratch array the tie geometry is computed in: 14 control point coordinates followed
     * by the bounding box (x, y, w, h).
     */
    public static newControlPoints(): number[] {
        const cps: number[] = [];
        for (let i = 0; i < 18; i++) {
            cps.push(0);
        }
        return cps;
    }

    private _setBoundingBoxFromCps(cp: number[], down: boolean, size: number): void {
        TieGlyph._calculateBoundingBoxFromCps(cp, down, size);
        this._boundingBoxX = cp[14];
        this._boundingBoxY = cp[15];
        this._boundingBoxW = cp[16];
        this._boundingBoxH = cp[17];
    }

    /**
     * Derives the bounding box of a tie from the control points in `cp[0..13]` and stores it in
     * `cp[14..17]` as x, y, w, h.
     */
    private static _calculateBoundingBoxFromCps(cp: number[], down: boolean, size: number): void {
        const p0x = cp[0];
        const p0y = cp[1];
        const c1x = cp[2];
        const c1y = cp[3];
        const c2x = cp[4];
        const c2y = cp[5];
        const p1x = cp[6];
        const p1y = cp[7];

        const midX = 0.125 * p0x + 0.375 * c1x + 0.375 * c2x + 0.125 * p1x;
        const midY = 0.125 * p0y + 0.375 * c1y + 0.375 * c2y + 0.125 * p1y;

        const xMin = Math.min(p0x, p1x, midX);
        const xMax = Math.max(p0x, p1x, midX);
        let yMin = Math.min(p0y, p1y, midY);
        let yMax = Math.max(p0y, p1y, midY);

        if (down) {
            yMax += size;
        } else {
            yMin -= size;
        }

        cp[14] = xMin;
        cp[15] = yMin;
        cp[16] = xMax - xMin;
        cp[17] = yMax - yMin;
    }

    /**
     * Writes the control points of the tie outline into `cps[0..13]`.
     * @returns false (and leaves `cps` untouched) when start and end coincide.
     */
    private static _computeBezierControlPoints(
        cps: number[],
        scale: number,
        x1: number,
        y1: number,
        x2: number,
        y2: number,
        down: boolean,
        offset: number,
        size: number
    ): boolean {
        if (x1 === x2 && y1 === y2) {
            return false;
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
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);

        let dx = cp1x - x1;
        let dy = cp1y - y1;
        cp1x = x1 + (dx * cos - dy * sin);
        cp1y = y1 + (dx * sin + dy * cos);

        dx = cp2x - x1;
        dy = cp2y - y1;
        cp2x = x1 + (dx * cos - dy * sin);
        cp2y = y1 + (dx * sin + dy * cos);

        dx = cp3x - x1;
        dy = cp3y - y1;
        cp3x = x1 + (dx * cos - dy * sin);
        cp3y = y1 + (dx * sin + dy * cos);

        dx = cp4x - x1;
        dy = cp4y - y1;
        cp4x = x1 + (dx * cos - dy * sin);
        cp4y = y1 + (dx * sin + dy * cos);

        cps[0] = x1;
        cps[1] = y1;
        cps[2] = cp1x;
        cps[3] = cp1y;
        cps[4] = cp2x;
        cps[5] = cp2y;
        cps[6] = x2;
        cps[7] = y2;
        cps[8] = cp3x;
        cps[9] = cp3y;
        cps[10] = cp4x;
        cps[11] = cp4y;
        cps[12] = x1;
        cps[13] = y1;
        return true;
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
        let cps = TieGlyph.newControlPoints();
        if (!TieGlyph._computeBezierControlPoints(cps, scale, x1, y1, x2, y2, down, offset, size)) {
            cps = [];
        }

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

    /** The peak `[x, y]` through which {@link drawBendSlur} draws the slur. */
    public static calculateBendSlurPeak(
        x1: number,
        y1: number,
        x2: number,
        y2: number,
        down: boolean,
        bendSlurHeight: number
    ): [number, number] {
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
        const centerX: number = (x2 + x1) / 2;
        const centerY: number = (y2 + y1) / 2;
        let offset: number = bendSlurHeight;
        if (x2 - x1 < 20) {
            offset /= 2;
        }
        return [centerX + offset * normalVectorX, centerY + offset * normalVectorY];
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
        return TieGlyph.calculateBendSlurPeak(x1, y1, x2, y2, down, bendSlurHeight * scale)[1];
    }

    public static calculateBendSlurHeight(
        x1: number,
        y1: number,
        x2: number,
        y2: number,
        down: boolean,
        bendSlurHeight: number
    ): Bounds {
        const cp1Y = TieGlyph.calculateBendSlurPeak(x1, y1, x2, y2, down, bendSlurHeight)[1];
        const minY = Math.min(y1, y2, cp1Y);
        const maxY = Math.max(y1, y2, cp1Y);
        return new Bounds(x1, minY, x2 - x1, maxY - minY);
    }

    public static drawBendSlur(
        canvas: ICanvas,
        x1: number,
        y1: number,
        x2: number,
        y2: number,
        down: boolean,
        bendSlurHeight: number,
        slurText?: string
    ): void {
        const peak = TieGlyph.calculateBendSlurPeak(x1, y1, x2, y2, down, bendSlurHeight);
        const cp1X = peak[0];
        const cp1Y = peak[1];
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

/**
 * A common tie implementation using note details for positioning
 * @internal
 */
export abstract class NoteTieGlyph extends TieGlyph {
    protected startNote: Note;
    protected endNote: Note;
    protected startNoteRenderer: LineBarRenderer | null = null;
    protected endNoteRenderer: LineBarRenderer | null = null;

    public constructor(slurEffectId: string, startNote: Note, endNote: Note, forEnd: boolean) {
        super(slurEffectId, forEnd);
        this.startNote = startNote;
        this.endNote = endNote;
    }

    protected get isLeftHandTap() {
        return this.startNote === this.endNote;
    }

    public override getTieHeight(startX: number, startY: number, endX: number, endY: number): number {
        if (this.isLeftHandTap) {
            return this.renderer!.smuflMetrics.tieHeight;
        }
        return super.getTieHeight(startX, startY, endX, endY);
    }

    protected override calculateTieDirection(): BeamDirection {
        // invert direction (if stems go up, ties go down to not cross them)
        switch (this.lookupStartBeatRenderer().getBeatDirection(this.startNote.beat)) {
            case BeamDirection.Up:
                return BeamDirection.Down;
            default:
                return BeamDirection.Up;
        }
    }

    protected override calculateStartX(): number {
        const startNoteRenderer = this.lookupStartBeatRenderer();
        if (this.isLeftHandTap) {
            return this.calculateEndX() - startNoteRenderer.smuflMetrics.leftHandTabTieWidth;
        }
        return startNoteRenderer.x + startNoteRenderer!.getNoteX(this.startNote, this.getStartNotePosition());
    }

    protected getStartNotePosition() {
        return NoteXPosition.Center;
    }

    protected override calculateStartY(): number {
        const startNoteRenderer = this.lookupStartBeatRenderer();
        if (this.isLeftHandTap) {
            return startNoteRenderer.getNoteY(this.startNote, NoteYPosition.Center);
        }

        switch (this.tieDirection) {
            case BeamDirection.Up:
                return startNoteRenderer!.getNoteY(this.startNote, NoteYPosition.Top);
            default:
                return startNoteRenderer.getNoteY(this.startNote, NoteYPosition.Bottom);
        }
    }

    protected override calculateEndX(): number {
        const endNoteRenderer = this.lookupEndBeatRenderer();
        if (!endNoteRenderer) {
            return this.calculateStartY() + this.renderer.smuflMetrics.leftHandTabTieWidth;
        }
        if (this.isLeftHandTap) {
            return endNoteRenderer!.x + endNoteRenderer!.getNoteX(this.endNote, NoteXPosition.Left);
        }
        return endNoteRenderer.x + endNoteRenderer.getNoteX(this.endNote, NoteXPosition.Center);
    }

    protected getEndNotePosition() {
        return NoteXPosition.Center;
    }

    protected override caclculateEndY(): number {
        const endNoteRenderer = this.lookupEndBeatRenderer();
        if (!endNoteRenderer) {
            return this.calculateStartY();
        }

        if (this.isLeftHandTap) {
            return endNoteRenderer!.getNoteY(this.endNote, NoteYPosition.Center);
        }

        switch (this.tieDirection) {
            case BeamDirection.Up:
                return endNoteRenderer!.getNoteY(this.endNote, NoteYPosition.Top);
            default:
                return endNoteRenderer!.getNoteY(this.endNote, NoteYPosition.Bottom);
        }
    }

    protected override lookupEndBeatRenderer() {
        if (!this.endNoteRenderer) {
            this.endNoteRenderer = this.renderer.scoreRenderer.layout!.getRendererForBar(
                this.renderer.staff!.staffId,
                this.endNote.beat.voice.bar
            ) as LineBarRenderer | null;
        }
        return this.endNoteRenderer;
    }

    protected override lookupStartBeatRenderer() {
        if (!this.startNoteRenderer) {
            this.startNoteRenderer = this.renderer.scoreRenderer.layout!.getRendererForBar(
                this.renderer.staff!.staffId,
                this.startNote.beat.voice.bar
            )! as LineBarRenderer;
        }
        return this.startNoteRenderer;
    }

    protected override shouldDrawBendSlur(): boolean {
        return false;
    }
}

/**
 * A tie glyph for continued multi-system ties/slurs
 * @internal
 */
export class ContinuationTieGlyph extends TieGlyph {
    private _startTie: TieGlyph;

    public constructor(startTie: TieGlyph) {
        super(startTie.slurEffectId, false);
        this._startTie = startTie;
    }

    protected override lookupStartBeatRenderer() {
        return this.renderer as LineBarRenderer;
    }

    protected override lookupEndBeatRenderer() {
        return this.renderer as LineBarRenderer;
    }

    protected override shouldDrawBendSlur(): boolean {
        return false;
    }

    protected override calculateTieDirection(): BeamDirection {
        return this._startTie.tieDirection;
    }

    protected override calculateStartY(): number {
        return this._startTie.calculateMultiSystemSlurY(this.renderer);
    }
    protected override caclculateEndY(): number {
        return this.calculateStartY();
    }

    protected override calculateStartX(): number {
        const first = this.renderer.staff!.barRenderers[0];
        return first.x + first.beatGlyphsStart - 2 * first.smuflMetrics.oneStaffSpace;
    }

    protected override calculateEndX(): number {
        const last = this.renderer.staff!.barRenderers[this.renderer.staff!.barRenderers.length - 1];
        return last.x + last.width;
    }
}
