import type { ICanvas } from '@src/platform/ICanvas';
import { EffectGlyph } from '@src/rendering/glyphs/EffectGlyph';
import type { MusicFontSymbol } from '@src/model/MusicFontSymbol';
import type { Color } from '@src/model/Color';
import { MusicFontSymbolSizes } from '@src/rendering/utils/MusicFontSymbolSizes';

export class MusicFontGlyph extends EffectGlyph {
    protected glyphScale: number = 0;
    public symbol: MusicFontSymbol;
    protected center: boolean = false;
    public colorOverride?: Color;

    public constructor(x: number, y: number, glyphScale: number, symbol: MusicFontSymbol) {
        super(x, y);
        this.glyphScale = glyphScale;
        this.symbol = symbol;
    }

    public override doLayout(): void {
        this.width = MusicFontSymbolSizes.Widths.has(this.symbol)
            ? MusicFontSymbolSizes.Widths.get(this.symbol)! * this.glyphScale
            : 0;

        this.height = MusicFontSymbolSizes.Heights.has(this.symbol)
            ? MusicFontSymbolSizes.Heights.get(this.symbol)! * this.glyphScale
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
