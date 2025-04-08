import { MusicFontSymbol } from '@src/model';
import { ICanvas } from '@src/platform';
import { LineBarRenderer } from '../LineBarRenderer';
import { Glyph } from './Glyph';
import { NumberGlyph } from './NumberGlyph';

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
