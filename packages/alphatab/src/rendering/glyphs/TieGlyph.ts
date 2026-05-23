import type { Note } from '@coderline/alphatab/model/Note';
import { TextAlign, TextBaseline, type ICanvas } from '@coderline/alphatab/platform/ICanvas';
import { type BarRendererBase, NoteXPosition, NoteYPosition } from '@coderline/alphatab/rendering/BarRendererBase';
import { Glyph } from '@coderline/alphatab/rendering/glyphs/Glyph';
import type { ResolvedTieGlyphLabel, TieGlyphLabel } from '@coderline/alphatab/rendering/glyphs/TieGlyphLabel';
import type { LineBarRenderer } from '@coderline/alphatab/rendering/LineBarRenderer';
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
export abstract class TieGlyph extends Glyph implements ITieGlyph {
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
    private _boundingBox?: Bounds;
    private _shouldPaint: boolean = false;
    // Resolved per-label paint state. Lazily grown; re-layouts mutate
    // existing entries in place and update `_resolvedLabelCount` to
    // signal how many of them are valid this pass.
    private _resolvedLabels: ResolvedTieGlyphLabel[] = [];
    private _resolvedLabelCount: number = 0;
    private _labelBaselineOffset: number = 0;

    public get checkForOverflow() {
        return this._shouldPaint && this._boundingBox !== undefined;
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
                }
            } else {
                this._shouldPaint = true;
                this._startX = this.calculateStartX();
                this._endX = this.calculateEndX();
                this._startY = this.calculateStartY();
                this._endY = this.caclculateEndY();
            }
            this._shouldPaint = true;
        } else if (startNoteRenderer.staff !== endNoteRenderer!.staff) {
            const firstRendererInStaff = startNoteRenderer.staff!.barRenderers[0];
            this._startX = firstRendererInStaff!.x;

            this._endX = this.calculateEndX();

            const startGlyph = startNoteRenderer.scoreRenderer.layout!.slurRegistry.completeMultiSystemSlur(this);
            if (startGlyph) {
                this._startY = startGlyph.calculateMultiSystemSlurY(endNoteRenderer!);
            } else {
                this._startY = this.caclculateEndY();
            }

            this._endY = this.caclculateEndY();

            this._shouldPaint = startNoteRenderer.staff !== endNoteRenderer!.staff;
        }

        this._boundingBox = undefined;
        this.y = Math.min(this._startY, this._endY);
        const down = this.tieDirection === BeamDirection.Down;
        let tieBoundingBox: Bounds;
        // Bezier control points for the tie. Computed once and reused
        // for both the bounding box (via _calculateActualTieHeightFromCps)
        // and label-apex sampling further below — avoids a redundant
        // call to _computeBezierControlPoints (and its 14-element array
        // allocation) per labeled slur per layout.
        let cps: number[] = [];
        if (this.shouldDrawBendSlur()) {
            this._tieHeight = 0;
            tieBoundingBox = TieGlyph.calculateBendSlurHeight(
                this._startX,
                this._startY,
                this._endX,
                this._endY,
                down,
                this.renderer.smuflMetrics.tieHeight
            );
        } else {
            this._tieHeight = this.getTieHeight(this._startX, this._startY, this._endX, this._endY);
            const tieThickness = this.renderer.smuflMetrics.tieMidpointThickness;
            cps = TieGlyph._computeBezierControlPoints(
                1,
                this._startX,
                this._startY,
                this._endX,
                this._endY,
                down,
                this._tieHeight,
                tieThickness
            );
            tieBoundingBox = TieGlyph._calculateActualTieHeightFromCps(
                cps,
                this._startX,
                this._startY,
                this._endX,
                this._endY,
                down,
                tieThickness
            );
        }

        this._boundingBox = tieBoundingBox;
        this._resolvedLabelCount = 0;
        const labels = this.getSlurLabels();
        if (labels !== null && labels.length > 0 && this.shouldPaintLabels()) {
            const res = this.renderer.settings.display.resources;
            const padding = this.renderer.smuflMetrics.oneStaffSpace * 0.25;
            let maxTextHeight = 0;

            // Single Y line for all labels — the outer arc apex.
            // Painted offset adds `padding` on the outward side, so
            // every label sits the same fixed distance from its arc.
            const labelLineY = cps.length > 0
                ? 0.125 * cps[7] + 0.375 * cps[9] + 0.375 * cps[11] + 0.125 * cps[13]
                : (this._startY + this._endY) / 2;

            for (const label of labels) {
                const fromX = this.resolveLabelAnchorX(label.fromNote);
                const toX = this.resolveLabelAnchorX(label.toNote);
                if (fromX === null || toX === null) {
                    continue;
                }
                const midX = (fromX + toX) / 2;
                if (midX < this._startX || midX > this._endX) {
                    continue;
                }

                // Per-element font.size as an upper bound on glyph
                // height — avoids per-label measureText calls. All H/P
                // and sl. labels use the same _effectFont, so this is
                // typically computed once.
                const font = res.getFontForNotationElement(label.element);
                if (font.size > maxTextHeight) {
                    maxTextHeight = font.size;
                }

                // grow cache lazily; mutate existing slot in place otherwise
                let slot: ResolvedTieGlyphLabel;
                if (this._resolvedLabelCount < this._resolvedLabels.length) {
                    slot = this._resolvedLabels[this._resolvedLabelCount];
                    slot.x = midX;
                    slot.y = labelLineY;
                    slot.text = label.text;
                    slot.element = label.element;
                } else {
                    slot = {
                        x: midX,
                        y: labelLineY,
                        text: label.text,
                        element: label.element
                    };
                    this._resolvedLabels.push(slot);
                }
                this._resolvedLabelCount++;
            }

            if (this._resolvedLabelCount > 0) {
                // canvas.textBaseline is 'hanging' (TextBaseline.Top), so
                // fillText positions `y` at the glyph's top edge.
                if (this.tieDirection === BeamDirection.Up) {
                    tieBoundingBox.y -= maxTextHeight + padding;
                    this._labelBaselineOffset = -(maxTextHeight + padding);
                } else {
                    this._labelBaselineOffset = padding;
                }
                tieBoundingBox.h += maxTextHeight + padding;
            }
        }

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

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        if (!this._shouldPaint) {
            return;
        }

        const isDown = this.tieDirection === BeamDirection.Down;

        if (this.shouldDrawBendSlur()) {
            TieGlyph.drawBendSlur(
                canvas,
                cx + this._startX,
                cy + this._startY,
                cx + this._endX,
                cy + this._endY,
                isDown,
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
                isDown,
                this._tieHeight,
                this.renderer.smuflMetrics.tieMidpointThickness
            );
        }

        if (this._resolvedLabelCount > 0) {
            const ta = canvas.textAlign;
            const tb = canvas.textBaseline;
            canvas.textAlign = TextAlign.Center;
            canvas.textBaseline = TextBaseline.Top;
            const res = this.renderer.resources;
            let lastElement = -1;
            for (let i = 0; i < this._resolvedLabelCount; i++) {
                const label = this._resolvedLabels[i];
                if (label.element !== lastElement) {
                    canvas.font = res.getFontForNotationElement(label.element);
                    lastElement = label.element;
                }
                canvas.fillText(label.text, cx + label.x, cy + label.y + this._labelBaselineOffset);
            }
            canvas.textAlign = ta;
            canvas.textBaseline = tb;
        }
    }

    /**
     * Returns the labels to paint along this slur, or `null` when there
     * are none. Override in subclasses.
     */
    protected getSlurLabels(): TieGlyphLabel[] | null {
        return null;
    }

    /**
     * Whether label painting is enabled. Defaults to `true`. Subclasses
     * may override to disable labels on the bend-slur path or other
     * special cases.
     */
    protected shouldPaintLabels(): boolean {
        return !this.shouldDrawBendSlur();
    }

    /**
     * Looks up the absolute X coordinate of an anchor note. Reuses
     * the start/end bar renderers already resolved by the subclass
     * (NoteTieGlyph) when the note's bar matches — most labels live
     * in the slur's start or end bar, so this avoids the double Map
     * lookup in `getRendererForBar` per label per layout. Returns
     * `null` when the note's bar is not rendered on this glyph's
     * staff (cross-system case).
     */
    protected resolveLabelAnchorX(note: Note): number | null {
        const bar = note.beat.voice.bar;
        let renderer: LineBarRenderer | null = null;
        const start = this.lookupStartBeatRenderer();
        if (start !== null && start.bar === bar) {
            renderer = start;
        } else {
            const end = this.lookupEndBeatRenderer();
            if (end !== null && end.bar === bar) {
                renderer = end;
            } else {
                renderer = this.renderer.scoreRenderer.layout!.getRendererForBar(
                    this.renderer.staff!.staffId,
                    bar
                ) as LineBarRenderer | null;
            }
        }
        if (renderer === null) {
            return null;
        }
        return renderer.x + renderer.getNoteX(note, NoteXPosition.Center);
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

    public calculateMultiSystemSlurY(renderer: BarRendererBase) {
        const startRenderer = this.lookupStartBeatRenderer();
        const startY = this.calculateStartY();
        const relY = startY - startRenderer.y;
        return renderer.y + relY;
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
        const cp = TieGlyph._computeBezierControlPoints(scale, x1, y1, x2, y2, down, offset, size);
        return TieGlyph._calculateActualTieHeightFromCps(cp, x1, y1, x2, y2, down, size);
    }

    /**
     * Derives the bounding box for a tie from already-computed control
     * points. Splits the bbox math from cps generation so callers that
     * need BOTH cps and bbox (e.g. multi-label slur layout) avoid a
     * second call to `_computeBezierControlPoints`.
     */
    private static _calculateActualTieHeightFromCps(
        cp: number[],
        x1: number,
        y1: number,
        x2: number,
        y2: number,
        down: boolean,
        size: number
    ): Bounds {
        if (cp.length === 0) {
            return new Bounds(x1, y1, x2 - x1, y2 - y1);
        }
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

    public static calculateBendSlurHeight(
        x1: number,
        y1: number,
        x2: number,
        y2: number,
        down: boolean,
        bendSlurHeight: number
    ): Bounds {
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
        const centerY: number = (y2 + y1) / 2;
        let offset: number = bendSlurHeight;
        if (x2 - x1 < 20) {
            offset /= 2;
        }
        const cp1Y: number = centerY + offset * normalVectorY;

        const minY = Math.min(y1, y2, cp1Y);
        const maxY = Math.max(y1, y2, cp1Y);

        return new Bounds(x1, Math.min(y1, y2, cp1Y), x2 - x1, maxY - minY);
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
            return startNoteRenderer.y + startNoteRenderer.getNoteY(this.startNote, NoteYPosition.Center);
        }

        switch (this.tieDirection) {
            case BeamDirection.Up:
                return startNoteRenderer.y + startNoteRenderer!.getNoteY(this.startNote, NoteYPosition.Top);
            default:
                return startNoteRenderer.y + startNoteRenderer.getNoteY(this.startNote, NoteYPosition.Bottom);
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
            return endNoteRenderer.y + endNoteRenderer!.getNoteY(this.endNote, NoteYPosition.Center);
        }

        switch (this.tieDirection) {
            case BeamDirection.Up:
                return endNoteRenderer.y + endNoteRenderer!.getNoteY(this.endNote, NoteYPosition.Top);
            default:
                return endNoteRenderer.y + endNoteRenderer!.getNoteY(this.endNote, NoteYPosition.Bottom);
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
        return this.renderer.staff!.barRenderers[0].x;
    }

    protected override calculateEndX(): number {
        const last = this.renderer.staff!.barRenderers[this.renderer.staff!.barRenderers.length - 1];
        return last.x + last.width;
    }
}
