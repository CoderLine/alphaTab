import { type ICanvas, TextAlign } from '@src/platform/ICanvas';
import { Glyph } from '@src/rendering/glyphs/Glyph';
import type { RenderingResources } from '@src/RenderingResources';
import type { LineBarRenderer } from '@src/rendering/LineBarRenderer';
import { ElementStyleHelper } from '@src/rendering/utils/ElementStyleHelper';

export class RepeatCountGlyph extends Glyph {
    private _count: number = 0;

    public constructor(x: number, y: number, count: number) {
        super(x, y);
        this._count = 0;
        this._count = count;
    }

    public override doLayout(): void {
        this.width = 0;
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
