import { type ICanvas, TextBaseline } from '@src/platform/ICanvas';
import { Glyph } from '@src/rendering/glyphs/Glyph';
import type { RenderingResources } from '@src/RenderingResources';
import type { LineBarRenderer } from '@src/rendering/LineBarRenderer';
import { ElementStyleHelper } from '@src/rendering/utils/ElementStyleHelper';

export class BarNumberGlyph extends Glyph {
    private _number: number = 0;

    public constructor(x: number, y: number, num: number) {
        super(x, y);
        this._number = num;
    }

    public override doLayout(): void {
        this.renderer.scoreRenderer.canvas!.font = this.renderer.resources.barNumberFont;
        this.width = this.renderer.scoreRenderer.canvas!.measureText(this._number.toString()).width + 5;
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        if (!this.renderer.staff.isFirstInSystem) {
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
        canvas.textBaseline = TextBaseline.Top;
        canvas.font = res.barNumberFont;
        canvas.fillText(this._number.toString(), cx + this.x, cy + this.y);
        canvas.textBaseline = baseline;
    }
}
