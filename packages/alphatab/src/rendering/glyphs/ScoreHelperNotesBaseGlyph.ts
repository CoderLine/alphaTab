import type { Beat } from '@coderline/alphatab/model/Beat';
import { ModelUtils } from '@coderline/alphatab/model/ModelUtils';
import type { ICanvas } from '@coderline/alphatab/platform/ICanvas';
import { GlyphGroup } from '@coderline/alphatab/rendering/glyphs/GlyphGroup';
import { TieGlyph } from '@coderline/alphatab/rendering/glyphs/TieGlyph';
import type { ScoreBarRenderer } from '@coderline/alphatab/rendering/ScoreBarRenderer';
import type { SkylineShape } from '@coderline/alphatab/rendering/skyline/SkylineShape';
import { BeamDirection } from '@coderline/alphatab/rendering/utils/BeamDirection';

/**
 * @internal
 */
export class ScoreHelperNotesBaseGlyph extends GlyphGroup {
    private _isMeasuring: boolean = false;
    private _measureShape: SkylineShape | null = null;

    /** The extent recorded since {@link beginMeasure}; `NaN` if nothing was recorded. */
    protected measuredLeft: number = Number.NaN;
    protected measuredRight: number = Number.NaN;
    protected measuredTop: number = Number.NaN;
    protected measuredBottom: number = Number.NaN;

    /**
     * Until {@link endMeasure}, {@link drawBendSlur} and {@link drawTie} record the extent of what they
     * would paint instead of painting: as bounding box and, if given, as drawn shape.
     */
    protected beginMeasure(shape: SkylineShape | null): void {
        this._isMeasuring = true;
        this._measureShape = shape;
        this.measuredLeft = Number.NaN;
        this.measuredRight = Number.NaN;
        this.measuredTop = Number.NaN;
        this.measuredBottom = Number.NaN;
    }

    protected endMeasure(): void {
        this._isMeasuring = false;
        this._measureShape = null;
    }

    /** Records a box in the bounding box and the shape. */
    protected measure(left: number, top: number, right: number, bottom: number): void {
        this._measureBounds(left, top, right, bottom);
        this._measureShape?.addBox(left, top, right, bottom);
    }

    private _measureBounds(left: number, top: number, right: number, bottom: number): void {
        this.measuredLeft = ModelUtils.minBoundingBox(this.measuredLeft, left);
        this.measuredRight = ModelUtils.maxBoundingBox(this.measuredRight, right);
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
        this._measureBounds(b.x, b.y, b.x + b.w, b.y + b.h);
        // the slur is drawn as two straight lines through its peak (TieGlyph.drawBendSlur)
        const centerX = TieGlyph.calculateBendSlurTopX(x1, y1, x2, y2, down, 1, slurHeight);
        const cp1Y = TieGlyph.calculateBendSlurTopY(x1, y1, x2, y2, down, 1, slurHeight);
        const shape = this._measureShape;
        if (shape) {
            shape.addLine(x1, y1, centerX, cp1Y, canvas.lineWidth);
            shape.addLine(centerX, cp1Y, x2, y2, canvas.lineWidth);
        }
        if (slurText) {
            // text placement of TieGlyph.drawBendSlur
            const size = canvas.measureText(slurText);
            const textTop = down ? cp1Y : cp1Y - canvas.font.size;
            this.measure(centerX - size.width / 2, textTop, centerX + size.width / 2, textTop + size.height);
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
            TieGlyph.paintTie(canvas, 1, x1, y1, x2, y2, down, offset, size);
            return;
        }
        const b = TieGlyph.calculateActualTieHeight(1, x1, y1, x2, y2, down, offset, size);
        this.measure(b.x, b.y, b.x + b.w, b.y + b.h);
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
