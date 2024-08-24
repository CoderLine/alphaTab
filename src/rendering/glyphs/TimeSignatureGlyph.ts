import { GlyphGroup } from '@src/rendering/glyphs/GlyphGroup';
import { MusicFontGlyph } from '@src/rendering/glyphs/MusicFontGlyph';
import { MusicFontSymbol } from '@src/model/MusicFontSymbol';
import { NumberGlyph } from '@src/rendering/glyphs/NumberGlyph';
import { GhostParenthesisGlyph } from './GhostParenthesisGlyph';

export abstract class TimeSignatureGlyph extends GlyphGroup {
    private _numerator: number = 0;
    private _denominator: number = 0;
    private _isCommon: boolean;
    private _isFreeTime: boolean;

    public constructor(
        x: number,
        y: number,
        numerator: number,
        denominator: number,
        isCommon: boolean,
        isFreeTime: boolean
    ) {
        super(x, y);
        this._numerator = numerator;
        this._denominator = denominator;
        this._isCommon = isCommon;
        this._isFreeTime = isFreeTime;
    }

    protected abstract get commonScale(): number;
    protected abstract get numberScale(): number;


    public override doLayout(): void {
        let x = 0;
        const numberHeight = NumberGlyph.numberHeight * this.scale;
        if (this._isFreeTime) {
            const g = new GhostParenthesisGlyph(true);
            g.renderer = this.renderer;
            g.y = -numberHeight;
            g.height = numberHeight * 2;
            g.doLayout();
            this.addGlyph(g);
            x += g.width + 10 * this.scale;
        }

        if (this._isCommon && this._numerator === 2 && this._denominator === 2) {
            let common: MusicFontGlyph = new MusicFontGlyph(x, 0, this.commonScale, MusicFontSymbol.TimeSigCutCommon);
            common.width = 14 * this.scale;
            this.addGlyph(common);
            super.doLayout();
        } else if (this._isCommon && this._numerator === 4 && this._denominator === 4) {
            let common: MusicFontGlyph = new MusicFontGlyph(x, 0, this.commonScale, MusicFontSymbol.TimeSigCommon);
            common.width = 14 * this.scale;
            this.addGlyph(common);
            super.doLayout();
        } else {
            let numerator: NumberGlyph = new NumberGlyph(x, -numberHeight / 2, this._numerator, this.numberScale);
            let denominator: NumberGlyph = new NumberGlyph(x, numberHeight / 2, this._denominator, this.numberScale);
            this.addGlyph(numerator);
            this.addGlyph(denominator);
            super.doLayout();

            const glyphSpace = this.width - x;
            numerator.x = x + (glyphSpace - numerator.width) / 2;
            denominator.x = x + (glyphSpace - denominator.width) / 2;
        }

        if (this._isFreeTime) {
            const g = new GhostParenthesisGlyph(false);
            g.renderer = this.renderer;
            g.x = this.width + 13 * this.scale;
            g.y = -numberHeight;
            g.height = numberHeight * 2;
            g.doLayout();
            this.addGlyph(g);
            this.width = g.x + g.width;
        }
    }
}
