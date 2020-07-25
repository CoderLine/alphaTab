import { ICanvas, TextAlign } from '@src/platform/ICanvas';
import { EffectGlyph } from '@src/rendering/glyphs/EffectGlyph';
import { RenderingResources } from '@src/RenderingResources';

export class LeftHandTapGlyph extends EffectGlyph {
    private static readonly Padding = 4;

    public constructor() {
        super(0, 0);
    }

    public doLayout(): void {
        super.doLayout();
        const font = this.renderer.resources.effectFont;
        this.height = font.size + LeftHandTapGlyph.Padding * this.scale;
    }

    public paint(cx: number, cy: number, canvas: ICanvas): void {
        let res: RenderingResources = this.renderer.resources;
        canvas.font = res.effectFont;
        let old: TextAlign = canvas.textAlign;
        canvas.textAlign = TextAlign.Center;
        canvas.fillText('T', cx + this.x, cy + this.y + canvas.font.size / 2);
        canvas.textAlign = old;
        canvas.strokeCircle(cx + this.x, cy + this.y + canvas.font.size / 2 + (LeftHandTapGlyph.Padding - 1) * this.scale, canvas.font.size / 1.6);
    }
}
