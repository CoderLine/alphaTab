import { ICanvas } from '@src/platform/ICanvas';
import { EffectGlyph } from '@src/rendering/glyphs/EffectGlyph';
import { MusicFontSymbol } from '@src/model/MusicFontSymbol';
import { Color } from '@src/model';

export class MusicFontGlyph extends EffectGlyph {
    protected glyphScale: number = 0;
    protected symbol: MusicFontSymbol;
    protected center: boolean = false;
    public colorOverride?: Color;

    public constructor(x: number, y: number, glyphScale: number, symbol: MusicFontSymbol) {
        super(x, y);
        this.glyphScale = glyphScale;
        this.symbol = symbol;
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
