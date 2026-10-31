import type { Beat } from '@coderline/alphatab/model/Beat';
import { ModelUtils } from '@coderline/alphatab/model/ModelUtils';
import type { ICanvas } from '@coderline/alphatab/platform/ICanvas';
import type { BendNoteHeadGroupGlyph } from '@coderline/alphatab/rendering/glyphs/BendNoteHeadGroupGlyph';
import { GlyphGroup } from '@coderline/alphatab/rendering/glyphs/GlyphGroup';
import { type ITieGlyph, TieGlyph } from '@coderline/alphatab/rendering/glyphs/TieGlyph';
import type { ScoreBarRenderer } from '@coderline/alphatab/rendering/ScoreBarRenderer';
import type { SkylineShape } from '@coderline/alphatab/rendering/skyline/SkylineShape';
import { BeamDirection } from '@coderline/alphatab/rendering/utils/BeamDirection';

/**
 * @internal
 */
export abstract class ScoreHelperNotesBaseGlyph extends GlyphGroup implements ITieGlyph {
    public readonly checkForOverflow = true;
    public readonly hasSkylineShape = true;

    /** Whether {@link measuredTop} and {@link measuredBottom} are valid for the current layout. */
    protected isMeasured: boolean = false;
    private _isMeasuring: boolean = false;
    private _measureShape: SkylineShape | null = null;

    /** The extent recorded since {@link _beginMeasure}; `NaN` if nothing was recorded. */
    protected measuredTop: number = Number.NaN;
    protected measuredBottom: number = Number.NaN;

    // The painted extent of the helper notes, slurs and slur texts ({@link ITieGlyph} convention:
    // renderer-local y). Only valid once the beats are positioned.

    public override getBoundingBoxTop(): number {
        this._measure();
        return this.measuredTop;
    }

    public override getBoundingBoxBottom(): number {
        this._measure();
        return this.measuredBottom;
    }

    /** The extent of the helper note heads as laid out, available before the beats are positioned. */
    protected getNoteHeadsBoundingBoxTop(): number {
        return super.getBoundingBoxTop();
    }

    protected getNoteHeadsBoundingBoxBottom(): number {
        return super.getBoundingBoxBottom();
    }

    private _measure(): void {
        if (this.isMeasured) {
            return;
        }
        this.isMeasured = true;
        this._beginMeasure(null);
        this.paintOrMeasure(0, -this.renderer.y, this.renderer.scoreRenderer.canvas!);
        this._endMeasure();
    }

    public collectSkylineShape(shape: SkylineShape): void {
        this._beginMeasure(shape);
        this.paintOrMeasure(0, -this.renderer.y, this.renderer.scoreRenderer.canvas!);
        this._endMeasure();
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        this.paintOrMeasure(cx, cy, canvas);
    }

    /**
     * Paints the glyph through {@link drawBendSlur}, {@link drawTie} and {@link paintOrMeasureHelperNotes},
     * which only record the extent while measuring.
     */
    protected abstract paintOrMeasure(cx: number, cy: number, canvas: ICanvas): void;

    /**
     * Until {@link _endMeasure}, {@link drawBendSlur} and {@link drawTie} record the extent of what they
     * would paint instead of painting: as bounding box and, if given, as drawn shape.
     */
    private _beginMeasure(shape: SkylineShape | null): void {
        this._isMeasuring = true;
        this._measureShape = shape;
        this.measuredTop = Number.NaN;
        this.measuredBottom = Number.NaN;
    }

    private _endMeasure(): void {
        this._isMeasuring = false;
        this._measureShape = null;
    }

    protected paintOrMeasureHelperNotes(glyph: BendNoteHeadGroupGlyph, canvas: ICanvas): void {
        if (this._isMeasuring) {
            this._measureBox(
                glyph.getBoundingBoxLeft(),
                glyph.getBoundingBoxTop(),
                glyph.getBoundingBoxRight(),
                glyph.getBoundingBoxBottom()
            );
        } else {
            glyph.paint(0, 0, canvas);
        }
    }

    /** Records a box in the bounding box and the shape. */
    private _measureBox(left: number, top: number, right: number, bottom: number): void {
        this._measureBounds(top, bottom);
        this._measureShape?.addBox(left, top, right, bottom);
    }

    private _measureBounds(top: number, bottom: number): void {
        this.measuredTop = ModelUtils.minBoundingBox(this.measuredTop, top);
        this.measuredBottom = ModelUtils.maxBoundingBox(this.measuredBottom, bottom);
    }

    protected drawBendSlur(
        canvas: ICanvas,
        x1: number,
        y1: number,
        x2: number,
        y2: number,
        down: boolean,
        slurText?: string
    ): void {
        const slurHeight = this.renderer.smuflMetrics.tieHeight;
        if (!this._isMeasuring) {
            TieGlyph.drawBendSlur(canvas, x1, y1, x2, y2, down, slurHeight, slurText);
            return;
        }

        const b = TieGlyph.calculateBendSlurHeight(x1, y1, x2, y2, down, slurHeight);
        this._measureBounds(b.y, b.y + b.h);
        // the slur is drawn as two straight lines through its peak (TieGlyph.drawBendSlur)
        const peak = TieGlyph.calculateBendSlurPeak(x1, y1, x2, y2, down, slurHeight);
        const centerX = peak[0];
        const cp1Y = peak[1];
        const shape = this._measureShape;
        if (shape) {
            shape.addLine(x1, y1, centerX, cp1Y, canvas.lineWidth);
            shape.addLine(centerX, cp1Y, x2, y2, canvas.lineWidth);
        }
        if (slurText) {
            // text placement of TieGlyph.drawBendSlur
            const size = canvas.measureText(slurText);
            const textTop = down ? cp1Y : cp1Y - canvas.font.size;
            this._measureBox(centerX - size.width / 2, textTop, centerX + size.width / 2, textTop + size.height);
        }
    }

    protected drawTie(
        canvas: ICanvas,
        x1: number,
        y1: number,
        x2: number,
        y2: number,
        down: boolean,
        offset: number,
        size: number
    ): void {
        if (!this._isMeasuring) {
            TieGlyph.paintTie(
                canvas,
                this.renderer.scoreRenderer.layout!.tiePaintControlPoints,
                1,
                x1,
                y1,
                x2,
                y2,
                down,
                offset,
                size
            );
            return;
        }
        const b = TieGlyph.calculateActualTieHeight(1, x1, y1, x2, y2, down, offset, size);
        this._measureBox(b.x, b.y, b.x + b.w, b.y + b.h);
    }

    public override doLayout(): void {
        if (!this.glyphs) {
            return;
        }

        this.width = 0;
        for (const noteHeads of this.glyphs) {
            noteHeads.doLayout();
            this.width += noteHeads.width;
        }
    }

    protected getTieDirection(beat: Beat, noteRenderer: ScoreBarRenderer): BeamDirection {
        // invert direction (if stems go up, ties go down to not cross them)
        switch (noteRenderer.getBeatDirection(beat)) {
            case BeamDirection.Up:
                return BeamDirection.Down;
            default:
                return BeamDirection.Up;
        }
    }
}
