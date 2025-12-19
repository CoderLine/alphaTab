import { BarSubElement } from '@coderline/alphatab/model/Bar';
import { Clef } from '@coderline/alphatab/model/Clef';
import { ModelUtils } from '@coderline/alphatab/model/ModelUtils';
import { MusicFontSymbol } from '@coderline/alphatab/model/MusicFontSymbol';
import { Ottavia } from '@coderline/alphatab/model/Ottavia';
import type { ICanvas } from '@coderline/alphatab/platform/ICanvas';
import { MusicFontGlyph } from '@coderline/alphatab/rendering/glyphs/MusicFontGlyph';
import { ElementStyleHelper } from '@coderline/alphatab/rendering/utils/ElementStyleHelper';

/**
 * @internal
 */
export class ClefGlyph extends MusicFontGlyph {
    private _clef: Clef;
    private _clefOttava: Ottavia;
    private _ottavaGlyph?: MusicFontGlyph;

    public constructor(x: number, y: number, clef: Clef, clefOttava: Ottavia) {
        super(x, y, 1, ClefGlyph._getSymbol(clef, clefOttava));
        this._clef = clef;
        this._clefOttava = clefOttava;
    }

    public override getBoundingBoxTop(): number {
        let top = super.getBoundingBoxTop();

        const ottava = this._ottavaGlyph;
        if (ottava) {
            const ottavaTop = this.y + ottava.getBoundingBoxTop();
            top = ModelUtils.minBoundingBox(top, ottavaTop);
        }

        return top;
    }

    public override getBoundingBoxBottom(): number {
        let bottom = super.getBoundingBoxBottom();

        const ottava = this._ottavaGlyph;
        if (ottava) {
            const ottavaBottom = this.y + ottava.getBoundingBoxBottom();
            bottom = ModelUtils.maxBoundingBox(bottom, ottavaBottom);
        }


        return bottom;
    }

    public override doLayout(): void {
        this.center = true;
        super.doLayout();
        this.width = this.renderer.smuflMetrics.glyphWidths.get(MusicFontSymbol.GClef)!;
        this.offsetX = this.width / 2;

        this._ottavaGlyph = undefined;
        switch (this._clef) {
            case Clef.C3:
            case Clef.C4:
                switch (this._clefOttava) {
                    case Ottavia._8vb:
                        return;
                }
                break;
            case Clef.F4:
            case Clef.G2:
                return;
        }

        let ottavaSymbol: MusicFontSymbol;
        let top: boolean = false;
        switch (this._clefOttava) {
            case Ottavia._15ma:
                ottavaSymbol = MusicFontSymbol.Clef15;
                top = true;
                break;
            case Ottavia._8va:
                ottavaSymbol = MusicFontSymbol.Clef8;
                top = true;
                break;
            case Ottavia._8vb:
                ottavaSymbol = MusicFontSymbol.Clef8;
                break;
            case Ottavia._15mb:
                ottavaSymbol = MusicFontSymbol.Clef15;
                break;
            default:
                return;
        }
        const ottavaX = this.width / 2;
        const ottavaY = top
            ? this.renderer.smuflMetrics.glyphTop.get(this.symbol)!
            : this.renderer.smuflMetrics.glyphBottom.get(this.symbol)! -
              this.renderer.smuflMetrics.glyphHeights.get(ottavaSymbol)!;
        this._ottavaGlyph = new MusicFontGlyph(ottavaX, -ottavaY, 1, ottavaSymbol);
        this._ottavaGlyph!.center = true;
        this._ottavaGlyph!.renderer = this.renderer;
        this._ottavaGlyph!.doLayout();
    }

    private static _getSymbol(clef: Clef, clefOttava: Ottavia): MusicFontSymbol {
        switch (clef) {
            case Clef.Neutral:
                return MusicFontSymbol.UnpitchedPercussionClef1;
            case Clef.C3:
            case Clef.C4:
                switch (clefOttava) {
                    case Ottavia._8vb:
                        return MusicFontSymbol.CClef8vb;
                    default:
                        return MusicFontSymbol.CClef;
                }
            case Clef.F4:
                switch (clefOttava) {
                    case Ottavia._15ma:
                        return MusicFontSymbol.FClef15ma;
                    case Ottavia._8va:
                        return MusicFontSymbol.FClef8va;
                    case Ottavia._8vb:
                        return MusicFontSymbol.FClef8vb;
                    case Ottavia._15mb:
                        return MusicFontSymbol.FClef15mb;
                    default:
                        return MusicFontSymbol.FClef;
                }
            case Clef.G2:
                switch (clefOttava) {
                    case Ottavia._15ma:
                        return MusicFontSymbol.GClef15ma;
                    case Ottavia._8va:
                        return MusicFontSymbol.GClef8va;
                    case Ottavia._8vb:
                        return MusicFontSymbol.GClef8vb;
                    case Ottavia._15mb:
                        return MusicFontSymbol.GClef15mb;
                    default:
                        return MusicFontSymbol.GClef;
                }
            default:
                return MusicFontSymbol.None;
        }
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        using _ = ElementStyleHelper.bar(canvas, BarSubElement.StandardNotationClef, this.renderer.bar);

        super.paint(cx, cy, canvas);

        const ottava = this._ottavaGlyph;
        if (ottava) {
            ottava.paint(cx + this.x, cy + this.y, canvas);
        }
    }
}
