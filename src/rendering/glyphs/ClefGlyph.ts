import { Clef } from '@src/model/Clef';
import { Ottavia } from '@src/model/Ottavia';
import type { ICanvas } from '@src/platform/ICanvas';
import { MusicFontGlyph } from '@src/rendering/glyphs/MusicFontGlyph';
import { MusicFontSymbol } from '@src/model/MusicFontSymbol';
import { ElementStyleHelper } from '@src/rendering/utils/ElementStyleHelper';
import { BarSubElement } from '@src/model/Bar';

export class ClefGlyph extends MusicFontGlyph {
    private _clef: Clef;
    private _clefOttava: Ottavia;

    public constructor(x: number, y: number, clef: Clef, clefOttava: Ottavia) {
        super(x, y, 1, ClefGlyph.getSymbol(clef, clefOttava));
        this._clef = clef;
        this._clefOttava = clefOttava;
    }

    public override doLayout(): void {
        this.center = true;
        super.doLayout();
        this.width = this.renderer.smuflMetrics.glyphWidths.get(MusicFontSymbol.GClef)!;
        this.offsetX = this.width / 2;
    }

    private static getSymbol(clef: Clef, clefOttava: Ottavia): MusicFontSymbol {
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

        cx += this.offsetX;
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

        let ottavaGlyph: MusicFontGlyph;
        let top: boolean = false;
        switch (this._clefOttava) {
            case Ottavia._15ma:
                ottavaGlyph = new MusicFontGlyph(0, 0, 1, MusicFontSymbol.Clef15);
                top = true;
                break;
            case Ottavia._8va:
                ottavaGlyph = new MusicFontGlyph(0, 0, 1, MusicFontSymbol.Clef8);
                top = true;
                break;
            case Ottavia._8vb:
                ottavaGlyph = new MusicFontGlyph(0, 0, 1, MusicFontSymbol.Clef8);
                break;
            case Ottavia._15mb:
                ottavaGlyph = new MusicFontGlyph(0, 0, 1, MusicFontSymbol.Clef15);
                break;
            default:
                return;
        }
        ottavaGlyph.center = true;
        ottavaGlyph.renderer = this.renderer;
        ottavaGlyph.doLayout();
        const ottavaX: number = this.width / 2;
        const ottavaY = top
            ? this.renderer.smuflMetrics.glyphTop.get(this.symbol)!
            : this.renderer.smuflMetrics.glyphBottom.get(this.symbol)! -
              this.renderer.smuflMetrics.glyphHeights.get(ottavaGlyph.symbol)!;
        ottavaGlyph.paint(cx + this.x + ottavaX, cy + this.y - ottavaY, canvas);
    }
}
