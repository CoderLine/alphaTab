import { Clef } from '@src/model/Clef';
import { Ottavia } from '@src/model/Ottavia';
import type { ICanvas } from '@src/platform/ICanvas';
import type { Glyph } from '@src/rendering/glyphs/Glyph';
import { MusicFontGlyph } from '@src/rendering/glyphs/MusicFontGlyph';
import { MusicFontSymbol } from '@src/model/MusicFontSymbol';
import { ElementStyleHelper } from '@src/rendering/utils/ElementStyleHelper';
import { BarSubElement } from '@src/model/Bar';

export class ClefGlyph extends MusicFontGlyph {
    private _clef: Clef;
    private _clefOttava: Ottavia;

    public constructor(x: number, y: number, clef: Clef, clefOttava: Ottavia) {
        super(x, y, 1, ClefGlyph.getSymbol(clef));
        this._clef = clef;
        this._clefOttava = clefOttava;
    }

    private static getSymbol(clef: Clef): MusicFontSymbol {
        switch (clef) {
            case Clef.Neutral:
                return MusicFontSymbol.UnpitchedPercussionClef1;
            case Clef.C3:
                return MusicFontSymbol.CClef;
            case Clef.C4:
                return MusicFontSymbol.CClef;
            case Clef.F4:
                return MusicFontSymbol.FClef;
            case Clef.G2:
                return MusicFontSymbol.GClef;
            default:
                return MusicFontSymbol.None;
        }
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        using _ = ElementStyleHelper.bar(canvas, BarSubElement.StandardNotationClef, this.renderer.bar);

        super.paint(cx, cy, canvas);
        let numberGlyph: Glyph;
        let top: boolean = false;
        let ottavaX = 0;
        if(this.renderer.smuflMetrics.clefOttavaOffsetX.has(this._clefOttava)) {
            ottavaX = this.renderer.smuflMetrics.clefOttavaOffsetX.get(this._clefOttava)!;
        }
        const ottavaScale = this.renderer.smuflMetrics.clefOttavaScale;
        switch (this._clefOttava) {
            case Ottavia._15ma:
                numberGlyph = new MusicFontGlyph(ottavaX, 0, ottavaScale, MusicFontSymbol.Quindicesima);
                top = true;
                break;
            case Ottavia._8va:
                numberGlyph = new MusicFontGlyph(ottavaX, 0, ottavaScale, MusicFontSymbol.Ottava);
                top = true;
                break;
            case Ottavia._8vb:
                numberGlyph = new MusicFontGlyph(ottavaX, 0, ottavaScale, MusicFontSymbol.Ottava);
                break;
            case Ottavia._15mb:
                numberGlyph = new MusicFontGlyph(ottavaX, 0, ottavaScale, MusicFontSymbol.Quindicesima);
                break;
            default:
                return;
        }
        let offsetY: number = 0;
        let offsetX: number = 0;
        const offsetYLookup = top ? this.renderer.smuflMetrics.clefOffsetYTop : this.renderer.smuflMetrics.clefOffsetY;
        if(offsetYLookup.has(this._clef)) {
            offsetY = offsetYLookup.get(this._clef)!;
        }

        if(this.renderer.smuflMetrics.clefOffsetX.has(this._clef)) {
            offsetX = this.renderer.smuflMetrics.clefOffsetX.get(this._clef)!;
        }

        numberGlyph.renderer = this.renderer;
        numberGlyph.doLayout();
        const x: number = this.width / 2;
        numberGlyph.paint(cx + this.x + x + offsetX, cy + this.y + offsetY, canvas);
    }
}
