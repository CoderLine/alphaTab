import { Clef } from '@src/model/Clef';
import { Ottavia } from '@src/model/Ottavia';
import { ICanvas } from '@src/platform/ICanvas';
import { Glyph } from '@src/rendering/glyphs/Glyph';
import { MusicFontGlyph } from '@src/rendering/glyphs/MusicFontGlyph';
import { MusicFontSymbol } from '@src/model/MusicFontSymbol';

export class ClefGlyph extends MusicFontGlyph {
    private _clef: Clef;
    private _clefOttava: Ottavia;

    public constructor(x: number, y: number, clef: Clef, clefOttava: Ottavia) {
        super(x, y, 1, ClefGlyph.getSymbol(clef));
        this._clef = clef;
        this._clefOttava = clefOttava;
    }

    public doLayout(): void {
        switch (this._clef) {
            case Clef.Neutral:
                this.width = 15 * this.scale;
                break;
            case Clef.C3:
            case Clef.C4:
            case Clef.F4:
            case Clef.G2:
                this.width = 28 * this.scale;
                break;
        }
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

    public paint(cx: number, cy: number, canvas: ICanvas): void {
        super.paint(cx, cy, canvas);
        let numberGlyph: Glyph;
        let top: boolean = false;
        switch (this._clefOttava) {
            case Ottavia._15ma:
                numberGlyph = new MusicFontGlyph(-4 * this.scale, 0, 0.5, MusicFontSymbol.Quindicesima);
                top = true;
                break;
            case Ottavia._8va:
                numberGlyph = new MusicFontGlyph(-2 * this.scale, 0, 0.5, MusicFontSymbol.Ottava);
                top = true;
                break;
            case Ottavia._8vb:
                numberGlyph = new MusicFontGlyph(-6 * this.scale, 0, 0.5, MusicFontSymbol.Ottava);
                break;
            case Ottavia._15mb:
                numberGlyph = new MusicFontGlyph(-8 * this.scale, 0, 0.5, MusicFontSymbol.Quindicesima);
                break;
            default:
                return;
        }
        let offsetY: number = 0;
        let offsetX: number = 0;
        switch (this._clef) {
            case Clef.Neutral:
                offsetY = top ? -12 : 15;
                offsetX = 0;
                break;
            case Clef.C3:
                offsetY = top ? -19 : 27;
                offsetX = 0;
                break;
            case Clef.C4:
                offsetY = top ? -19 : 27;
                offsetX = 0;
                break;
            case Clef.F4:
                offsetY = top ? -9 : 27;
                offsetX = -4;
                break;
            case Clef.G2:
                offsetY = top ? -37 : 30;
                offsetX = 0;
                break;
            default:
                return;
        }
        numberGlyph.renderer = this.renderer;
        numberGlyph.doLayout();
        let x: number = this.width / 2;
        numberGlyph.paint(cx + this.x + x + offsetX * this.scale, cy + this.y + offsetY * this.scale, canvas);
    }
}
