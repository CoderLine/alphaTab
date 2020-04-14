import { MusicFontGlyph } from '@src/rendering/glyphs/MusicFontGlyph';
import { MusicFontSymbol } from '@src/rendering/glyphs/MusicFontSymbol';

export class DigitGlyph extends MusicFontGlyph {
    private _digit: number = 0;
    private _scale: number = 0;

    public constructor(x: number, y: number, digit: number, scale: number) {
        super(x, y, scale, DigitGlyph.getSymbol(digit));
        this._digit = digit;
        this._scale = scale;
    }

    public doLayout(): void {
        this.y += 7 * this.scale;
        this.width = this.getDigitWidth(this._digit) * this.scale * this._scale;
    }

    private getDigitWidth(digit: number): number {
        switch (digit) {
            case 0:
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
            case 7:
            case 8:
            case 9:
                return 14;
            case 1:
                return 10;
            default:
                return 0;
        }
    }

    private static getSymbol(digit: number): MusicFontSymbol {
        switch (digit) {
            case 0:
                return MusicFontSymbol.Num0;
            case 1:
                return MusicFontSymbol.Num1;
            case 2:
                return MusicFontSymbol.Num2;
            case 3:
                return MusicFontSymbol.Num3;
            case 4:
                return MusicFontSymbol.Num4;
            case 5:
                return MusicFontSymbol.Num5;
            case 6:
                return MusicFontSymbol.Num6;
            case 7:
                return MusicFontSymbol.Num7;
            case 8:
                return MusicFontSymbol.Num8;
            case 9:
                return MusicFontSymbol.Num9;
            default:
                return MusicFontSymbol.None;
        }
    }
}
