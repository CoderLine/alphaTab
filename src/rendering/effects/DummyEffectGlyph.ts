import { ICanvas } from '@src/platform/ICanvas';
import { EffectGlyph } from '@src/rendering/glyphs/EffectGlyph';
import { RenderingResources } from '@src/RenderingResources';

export class DummyEffectGlyph extends EffectGlyph {
    private _s: string;

    public constructor(x: number, y: number, s: string) {
        super(x, y);
        this._s = s;
    }

    public doLayout(): void {
        this.width = 20 * this.scale;
    }

    public paint(cx: number, cy: number, canvas: ICanvas): void {
        let res: RenderingResources = this.renderer.resources;
        canvas.strokeRect(cx + this.x, cy + this.y, this.width, 20 * this.scale);
        canvas.font = res.tablatureFont;
        canvas.fillText(this._s, cx + this.x, cy + this.y);
    }
}
