import { ICanvas } from '@src/platform/ICanvas';
import { EffectGlyph } from '@src/rendering/glyphs/EffectGlyph';
import { MusicFontSymbol } from '@src/model/MusicFontSymbol';

export class MusicFontGlyph extends EffectGlyph {
    protected glyphScale: number = 0;
    protected symbol: MusicFontSymbol;

    public constructor(x: number, y: number, glyphScale: number, symbol: MusicFontSymbol) {
        super(x, y);
        this.glyphScale = glyphScale;
        this.symbol = symbol;
    }

    public paint(cx: number, cy: number, canvas: ICanvas): void {
        canvas.fillMusicFontSymbol(cx + this.x, cy + this.y, this.glyphScale * this.scale, this.symbol, false);
    }
}
