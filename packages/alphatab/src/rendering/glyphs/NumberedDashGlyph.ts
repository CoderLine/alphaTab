import { Glyph } from '@src/rendering/glyphs/Glyph';
import { ElementStyleHelper } from '@src/rendering/utils/ElementStyleHelper';
import { type Beat, BeatSubElement } from '@src/model/Beat';
import type { ICanvas } from '@src/platform/ICanvas';

/**
 * @internal
 */
export class NumberedDashGlyph extends Glyph {
    private _beat: Beat;

    public constructor(x: number, y: number, beat: Beat) {
        super(x, y);
        this._beat = beat;
    }

    public override doLayout(): void {
        this.width =
            this.renderer.smuflMetrics.numberedDashGlyphWidth + this.renderer.smuflMetrics.numberedDashGlyphPadding;
        this.height = this.renderer.smuflMetrics.numberedBarRendererBarSize;
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        using _ = ElementStyleHelper.beat(canvas, BeatSubElement.NumberedDuration, this._beat);
        const padding = this.renderer.smuflMetrics.numberedDashGlyphPadding;
        canvas.fillRect(cx + this.x, Math.ceil(cy + this.y - this.height), this.width - padding, this.height);
    }
}
