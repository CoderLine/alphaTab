import type { ICanvas } from '@coderline/alphatab/platform/ICanvas';
import type { RenderingResources } from '@coderline/alphatab/RenderingResources';
import { Glyph } from '@coderline/alphatab/rendering/glyphs/Glyph';
import type { LineBarRenderer } from '@coderline/alphatab/rendering/LineBarRenderer';
import { ElementStyleHelper } from '@coderline/alphatab/rendering/utils/ElementStyleHelper';

/**
 * @internal
 */
export class BarNumberGlyph extends Glyph {
    private _number: string;

    public constructor(x: number, y: number, num: number) {
        super(x, y);
        this._number = `${num}  `;
    }

    public override doLayout(): void {
        this.renderer.scoreRenderer.canvas!.font = this.renderer.resources.barNumberFont;
        const size = this.renderer.scoreRenderer.canvas!.measureText(this._number);
        this.width = size.width;
        this.height = size.height;
        this.y -= this.height;
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        if (!this.renderer.staff!.isFirstInSystem) {
            return;
        }

        using _ = ElementStyleHelper.bar(
            canvas,
            (this.renderer as LineBarRenderer).barNumberBarSubElement,
            this.renderer.bar,
            true
        );

        const res: RenderingResources = this.renderer.resources;
        const baseline = canvas.textBaseline;
        canvas.font = res.barNumberFont;
        canvas.fillText(this._number, cx + this.x, cy + this.y);
        canvas.textBaseline = baseline;
    }
}
