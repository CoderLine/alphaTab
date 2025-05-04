import { GlyphGroup } from '@src/rendering/glyphs/GlyphGroup';
import { MusicFontGlyph } from '@src/rendering/glyphs/MusicFontGlyph';
import { MusicFontSymbol } from '@src/model/MusicFontSymbol';
import { NumberGlyph } from '@src/rendering/glyphs/NumberGlyph';
import { GhostParenthesisGlyph } from '@src/rendering/glyphs/GhostParenthesisGlyph';
import { ElementStyleHelper } from '@src/rendering/utils/ElementStyleHelper';
import { BarSubElement } from '@src/model/Bar';
import type { ICanvas } from '@src/platform/ICanvas';

export abstract class TimeSignatureGlyph extends GlyphGroup {
    private _numerator: number = 0;
    private _denominator: number = 0;
    private _isCommon: boolean;
    private _isFreeTime: boolean;
    public barSubElement: BarSubElement = BarSubElement.StandardNotationTimeSignature;

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

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        using _ = ElementStyleHelper.bar(canvas, this.barSubElement, this.renderer.bar);
        super.paint(cx, cy, canvas);
    }

    public override doLayout(): void {
        let x = 0;
        const numberHeight = NumberGlyph.numberHeight;
        if (this._isFreeTime) {
            const g = new GhostParenthesisGlyph(true);
            g.renderer = this.renderer;
            g.y = -numberHeight;
            g.height = numberHeight * 2;
            g.doLayout();
            this.addGlyph(g);
            x += g.width + 10 * 1;
        }

        if (this._isCommon && this._numerator === 2 && this._denominator === 2) {
            const common: MusicFontGlyph = new MusicFontGlyph(x, 0, this.commonScale, MusicFontSymbol.TimeSigCutCommon);
            this.addGlyph(common);
            super.doLayout();
        } else if (this._isCommon && this._numerator === 4 && this._denominator === 4) {
            const common: MusicFontGlyph = new MusicFontGlyph(x, 0, this.commonScale, MusicFontSymbol.TimeSigCommon);
            this.addGlyph(common);
            super.doLayout();
        } else {
            const numerator: NumberGlyph = new NumberGlyph(x, -numberHeight / 2, this._numerator, this.numberScale);
            const denominator: NumberGlyph = new NumberGlyph(x, numberHeight / 2, this._denominator, this.numberScale);
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
            g.x = this.width + 13;
            g.y = -numberHeight;
            g.height = numberHeight * 2;
            g.doLayout();
            this.addGlyph(g);
            this.width = g.x + g.width;
        }
    }
}
