import { Glyph } from '@src/rendering/glyphs/Glyph';
import { GlyphGroup } from '@src/rendering/glyphs/GlyphGroup';
import { MusicFontGlyph } from '@src/rendering/glyphs/MusicFontGlyph';
import { MusicFontSymbol } from '@src/model/MusicFontSymbol';
import { NumberGlyph } from '@src/rendering/glyphs/NumberGlyph';

export abstract class TimeSignatureGlyph extends GlyphGroup {
    private _numerator: number = 0;
    private _denominator: number = 0;
    private _isCommon: boolean;

    public constructor(x: number, y: number, numerator: number, denominator: number, isCommon: boolean) {
        super(x, y);
        this._numerator = numerator;
        this._denominator = denominator;
        this._isCommon = isCommon;
    }

    protected abstract get commonScale(): number;
    protected abstract get numberScale(): number;

    public doLayout(): void {
        if (this._isCommon && this._numerator === 2 && this._denominator === 2) {
            let common: MusicFontGlyph = new MusicFontGlyph(
                0,
                0,
                this.commonScale,
                MusicFontSymbol.TimeSigCutCommon
            );
            common.width = 14 * this.scale;
            this.addGlyph(common);
            super.doLayout();
        } else if (this._isCommon && this._numerator === 4 && this._denominator === 4) {
            let common: MusicFontGlyph = new MusicFontGlyph(
                0,
                0,
                this.commonScale,
                MusicFontSymbol.TimeSigCommon
            );
            common.width = 14 * this.scale;
            this.addGlyph(common);
            super.doLayout();
        } else {
            const numberHeight = NumberGlyph.numberHeight * this.scale;
            let numerator: NumberGlyph = new NumberGlyph(0, -numberHeight / 2, this._numerator, this.numberScale);
            let denominator: NumberGlyph = new NumberGlyph(0, numberHeight / 2, this._denominator, this.numberScale);
            this.addGlyph(numerator);
            this.addGlyph(denominator);
            super.doLayout();
            for (let i: number = 0, j: number = this.glyphs!.length; i < j; i++) {
                let g: Glyph = this.glyphs![i];
                g.x = (this.width - g.width) / 2;
            }
        }
    }
}
