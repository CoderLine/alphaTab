import type { ICanvas } from '@src/platform/ICanvas';
import { EffectGlyph } from '@src/rendering/glyphs/EffectGlyph';
import type { MusicFontSymbol } from '@src/model/MusicFontSymbol';
import type { Color } from '@src/model/Color';

export class MusicFontGlyph extends EffectGlyph {
    protected glyphScale: number = 0;
    public symbol: MusicFontSymbol;
    public center: boolean = false;
    public colorOverride?: Color;
    public offsetX: number = 0;
    public offsetY: number = 0;

    public constructor(x: number, y: number, glyphScale: number, symbol: MusicFontSymbol) {
        super(x, y);
        this.glyphScale = glyphScale;
        this.symbol = symbol;
    }

    public override getBoundingBoxTop(): number {
        const bBoxTop = this.renderer.smuflMetrics.glyphTop.get(this.symbol)!;
        return this.y - this.offsetY - bBoxTop;
    }

    public override doLayout(): void {
        this.width = this.renderer.smuflMetrics.glyphWidths.has(this.symbol)
            ? this.renderer.smuflMetrics.glyphWidths.get(this.symbol)! * this.glyphScale
            : 0;
        this.height = this.renderer.smuflMetrics.glyphHeights.has(this.symbol)
            ? this.renderer.smuflMetrics.glyphHeights.get(this.symbol)! * this.glyphScale
            : 0;
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        const c = canvas.color;
        if (this.colorOverride) {
            canvas.color = this.colorOverride!;
        }
        canvas.fillMusicFontSymbol(
            cx + this.x + this.offsetX,
            cy + this.y + this.offsetY,
            this.glyphScale,
            this.symbol,
            this.center
        );
        canvas.color = c;
    }
}
