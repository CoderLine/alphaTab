import { MusicFontSymbol } from '@src/model/MusicFontSymbol';
import { Glyph } from '@src/rendering/glyphs/Glyph';
import { type ICanvas, TextBaseline } from '@src/platform/ICanvas';

/**
 * @internal
 */
export class NumberGlyph extends Glyph {
    private _scale: number = 0;
    private _baseline: TextBaseline;

    private _symbols: MusicFontSymbol[] = [];

    public constructor(x: number, y: number, num: number, baseline: TextBaseline, scale: number = 1.0) {
        super(x, y);
        this._symbols = NumberGlyph.getSymbols(num);
        this._scale = scale;
        this._baseline = baseline;
    }

    public static getSymbols(number: number): MusicFontSymbol[] {
        const symbols: MusicFontSymbol[] = [];
        while (number > 0) {
            const digit: number = number % 10;
            symbols.unshift(NumberGlyph.getSymbol(digit));
            number = (number / 10) | 0;
        }
        return symbols;
    }

    public static getSymbol(digit: number): MusicFontSymbol {
        switch (digit) {
            case 0:
                return MusicFontSymbol.TimeSig0;
            case 1:
                return MusicFontSymbol.TimeSig1;
            case 2:
                return MusicFontSymbol.TimeSig2;
            case 3:
                return MusicFontSymbol.TimeSig3;
            case 4:
                return MusicFontSymbol.TimeSig4;
            case 5:
                return MusicFontSymbol.TimeSig5;
            case 6:
                return MusicFontSymbol.TimeSig6;
            case 7:
                return MusicFontSymbol.TimeSig7;
            case 8:
                return MusicFontSymbol.TimeSig8;
            case 9:
                return MusicFontSymbol.TimeSig9;
            default:
                return MusicFontSymbol.None;
        }
    }

    public override doLayout(): void {
        let w = 0;
        for (const d of this._symbols) {
            w += this.renderer.smuflMetrics.glyphWidths.get(d)!;
        }
        this.width = w;
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        switch (this._baseline) {
            case TextBaseline.Top:
                cy += this.renderer.smuflMetrics.glyphBottom.get(this._symbols[0])!;
                break;
            case TextBaseline.Bottom:
                cy += this.renderer.smuflMetrics.glyphTop.get(this._symbols[0])!;
                break;
        }

        canvas.fillMusicFontSymbols(cx + this.x, cy + this.y, this._scale, this._symbols);
    }
}
