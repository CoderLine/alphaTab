import { type ICanvas, TextAlign } from '@src/platform/ICanvas';
import { EffectGlyph } from '@src/rendering/glyphs/EffectGlyph';
import type { RenderingResources } from '@src/RenderingResources';

export class LeftHandTapGlyph extends EffectGlyph {
    public constructor() {
        super(0, 0);
    }

    public override doLayout(): void {
        super.doLayout();
        const font = this.renderer.resources.effectFont;
        this.height = font.size + this.renderer.smuflMetrics.leftHandTappingPadding;
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        const res: RenderingResources = this.renderer.resources;
        canvas.font = res.effectFont;
        const old: TextAlign = canvas.textAlign;
        canvas.textAlign = TextAlign.Center;
        canvas.fillText('T', cx + this.x, cy + this.y + canvas.font.size / 2);
        canvas.textAlign = old;
        canvas.strokeCircle(
            cx + this.x,
            cy + this.y + canvas.font.size / 2 + (this.renderer.smuflMetrics.leftHandTappingPadding - 1),
            canvas.font.size * this.renderer.smuflMetrics.leftHandTappingCircleScale
        );
    }
}
