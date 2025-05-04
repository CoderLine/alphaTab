import { MusicFontSymbol } from '@src/model/MusicFontSymbol';
import type { ICanvas } from '@src/platform/ICanvas';
import type { LineBarRenderer } from '@src/rendering/LineBarRenderer';
import { Glyph } from '@src/rendering/glyphs/Glyph';
import { NumberGlyph } from '@src/rendering/glyphs/NumberGlyph';

export class MultiBarRestGlyph extends Glyph {
    private _numberGlyph: MusicFontSymbol[] = [];
    private static readonly BarWidth = 60;
    constructor() {
        super(0, 0);
    }

    public override doLayout(): void {
        this.width = 70;
        this.renderer.registerOverflowTop((this.renderer as LineBarRenderer).getLineHeight(1));
        const i: number = this.renderer.additionalMultiRestBars!.length + 1;
        this._numberGlyph = NumberGlyph.getSymbols(i);
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        canvas.fillMusicFontSymbols(cx + this.x, cy + this.y + this.renderer.height / 2, 1, [
            MusicFontSymbol.RestHBarLeft,
            MusicFontSymbol.RestHBarMiddle,
            MusicFontSymbol.RestHBarMiddle,
            MusicFontSymbol.RestHBarMiddle,
            MusicFontSymbol.RestHBarRight
        ]);

        const numberTop = (this.renderer as LineBarRenderer).getLineY(-1.5);

        canvas.fillMusicFontSymbols(
            cx + this.x + MultiBarRestGlyph.BarWidth / 2,
            (cy + this.y + numberTop) | 0,
            1,
            this._numberGlyph,
            true
        );
    }
}
