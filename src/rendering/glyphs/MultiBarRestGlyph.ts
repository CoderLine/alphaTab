import { MusicFontSymbol } from '@src/model/MusicFontSymbol';
import type { ICanvas } from '@src/platform/ICanvas';
import type { LineBarRenderer } from '@src/rendering/LineBarRenderer';
import { Glyph } from '@src/rendering/glyphs/Glyph';
import { NumberGlyph } from '@src/rendering/glyphs/NumberGlyph';

export class MultiBarRestGlyph extends Glyph {
    private static readonly RestSymbols = [
        MusicFontSymbol.RestHBarLeft,
        MusicFontSymbol.RestHBarMiddle,
        MusicFontSymbol.RestHBarMiddle,
        MusicFontSymbol.RestHBarMiddle,
        MusicFontSymbol.RestHBarRight
    ];

    private _numberGlyph: MusicFontSymbol[] = [];
    constructor() {
        super(0, 0);
    }

    public override doLayout(): void {
        this.width = MultiBarRestGlyph.RestSymbols.reduce((p, c) => p + this.renderer.smuflMetrics.glyphWidths.get(c)!, 0);
        this.renderer.registerOverflowTop((this.renderer as LineBarRenderer).getLineHeight(1));
        const i: number = this.renderer.additionalMultiRestBars!.length + 1;
        this._numberGlyph = NumberGlyph.getSymbols(i);
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        canvas.fillMusicFontSymbols(cx + this.x, cy + this.y + this.renderer.height / 2, 1, 
            MultiBarRestGlyph.RestSymbols
        );

        const numberTop = (this.renderer as LineBarRenderer).getLineY(-1.5);

        canvas.fillMusicFontSymbols(
            cx + this.x + this.width / 2,
            (cy + this.y + numberTop) | 0,
            1,
            this._numberGlyph,
            true
        );
    }
}
