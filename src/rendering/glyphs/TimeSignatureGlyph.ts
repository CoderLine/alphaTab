import { GlyphGroup } from '@src/rendering/glyphs/GlyphGroup';
import { MusicFontGlyph } from '@src/rendering/glyphs/MusicFontGlyph';
import { MusicFontSymbol } from '@src/model/MusicFontSymbol';
import { NumberGlyph } from '@src/rendering/glyphs/NumberGlyph';
import { GhostParenthesisGlyph } from '@src/rendering/glyphs/GhostParenthesisGlyph';
import { ElementStyleHelper } from '@src/rendering/utils/ElementStyleHelper';
import { BarSubElement } from '@src/model/Bar';
import { TextBaseline, type ICanvas } from '@src/platform/ICanvas';

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
        if (this._isCommon && this._numerator === 2 && this._denominator === 2) {
            const common: MusicFontGlyph = new MusicFontGlyph(0, 0, this.commonScale, MusicFontSymbol.TimeSigCutCommon);
            this.addGlyph(common);
            super.doLayout();
        } else if (this._isCommon && this._numerator === 4 && this._denominator === 4) {
            const common: MusicFontGlyph = new MusicFontGlyph(0, 0, this.commonScale, MusicFontSymbol.TimeSigCommon);
            this.addGlyph(common);
            super.doLayout();
        } else {
            // TODO: ensure we align them exactly so they meet in the staff center (use glyphTop and glyphBottom accordingly)
            const numerator: NumberGlyph = new NumberGlyph(
                0,
                0,
                this._numerator,
                TextBaseline.Bottom,
                this.numberScale
            );
            const denominator: NumberGlyph = new NumberGlyph(
                0,
                0,
                this._denominator,
                TextBaseline.Top,
                this.numberScale
            );
            this.addGlyph(numerator);
            this.addGlyph(denominator);
            super.doLayout();

            const glyphSpace = this.width;
            numerator.x = (glyphSpace - numerator.width) / 2;
            denominator.x = (glyphSpace - denominator.width) / 2;

            this.width = Math.max(
                numerator.x + numerator.width,
                denominator.x + denominator.width
            )
        }

        if (this._isFreeTime) {
            const numberHeight = this.renderer.smuflMetrics.oneStaffSpace * 2;
            const openParenthesis = new GhostParenthesisGlyph(true);
            openParenthesis.renderer = this.renderer;
            openParenthesis.y = -numberHeight;
            openParenthesis.height = numberHeight * 2;
            openParenthesis.doLayout();

            for(const g of this.glyphs!) {
                g.x += openParenthesis.width;
            }
            this.width += openParenthesis.width;

            this.addGlyph(openParenthesis);

            const closeParenthesis = new GhostParenthesisGlyph(false);
            closeParenthesis.renderer = this.renderer;
            closeParenthesis.x = this.width;
            closeParenthesis.y = -numberHeight;
            closeParenthesis.height = numberHeight * 2;
            closeParenthesis.doLayout();
            this.addGlyph(closeParenthesis);
            this.width += closeParenthesis.width;
        }
    }
}
