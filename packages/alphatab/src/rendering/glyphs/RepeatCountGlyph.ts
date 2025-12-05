import { type ICanvas, TextAlign } from '@coderline/alphatab/platform/ICanvas';
import { Glyph } from '@coderline/alphatab/rendering/glyphs/Glyph';
import type { RenderingResources } from '@coderline/alphatab/RenderingResources';
import type { LineBarRenderer } from '@coderline/alphatab/rendering/LineBarRenderer';
import { ElementStyleHelper } from '@coderline/alphatab/rendering/utils/ElementStyleHelper';

/**
 * @internal
 */
export class RepeatCountGlyph extends Glyph {
    private _count: number = 0;

    public constructor(x: number, y: number, count: number) {
        super(x, y);
        this._count = 0;
        this._count = count;
    }

    public override doLayout(): void {
        this.renderer.scoreRenderer.canvas!.font = this.renderer.resources.barNumberFont;
        const size = this.renderer.scoreRenderer.canvas!.measureText(`x${this._count}`);
        this.width = 0; // do not account width
        this.height = size.height;
        this.y -= size.height;
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        using _ = ElementStyleHelper.bar(
            canvas,
            (this.renderer as LineBarRenderer).repeatsBarSubElement,
            this.renderer.bar
        );

        const res: RenderingResources = this.renderer.resources;
        const oldAlign: TextAlign = canvas.textAlign;
        canvas.font = res.barNumberFont;
        canvas.textAlign = TextAlign.Right;
        const s: string = `x${this._count}`;
        const w: number = canvas.measureText(s).width / 1.5;
        canvas.fillText(s, cx + this.x - w, cy + this.y);
        canvas.textAlign = oldAlign;
    }
}
