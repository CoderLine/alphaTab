import type { ICanvas } from '@src/platform/ICanvas';
import { EffectGlyph } from '@src/rendering/glyphs/EffectGlyph';
import type { MusicFontSymbol } from '@src/model/MusicFontSymbol';
import type { Color } from '@src/model/Color';

export class MusicFontGlyph extends EffectGlyph {
    protected glyphScale: number = 0;
    public symbol: MusicFontSymbol;
    public center: boolean = false;
    public colorOverride?: Color;

    public constructor(x: number, y: number, glyphScale: number, symbol: MusicFontSymbol) {
        super(x, y);
        this.glyphScale = glyphScale;
        this.symbol = symbol;
    }

    public override doLayout(): void {
        this.width = this.renderer.smuflMetrics.GlyphWidths.has(this.symbol)
            ? this.renderer.smuflMetrics.GlyphWidths.get(this.symbol)! * this.glyphScale
            : 0;

        this.height = this.renderer.smuflMetrics.GlyphHeights.has(this.symbol)
            ? this.renderer.smuflMetrics.GlyphHeights.get(this.symbol)! * this.glyphScale
            : 0;
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        const c = canvas.color;
        if (this.colorOverride) {
            canvas.color = this.colorOverride!;
        }
        canvas.fillMusicFontSymbol(cx + this.x, cy + this.y, this.glyphScale, this.symbol, this.center);
        canvas.color = c;
    }
}
