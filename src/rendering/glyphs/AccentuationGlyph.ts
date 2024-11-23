import { AccentuationType } from '@src/model/AccentuationType';
import { MusicFontSymbol } from '@src/model/MusicFontSymbol';
import { ICanvas } from '@src/platform/ICanvas';
import { Note } from '@src/model';
import { EffectGlyph } from './EffectGlyph';
import { BeamDirection } from '../utils/BeamDirection';

export class AccentuationGlyph extends EffectGlyph {
    private _note: Note;
    public constructor(x: number, y: number, note: Note) {
        super(x, y);
        this._note = note;
    }

    private static getSymbol(accentuation: AccentuationType, above: boolean): MusicFontSymbol {
        switch (accentuation) {
            case AccentuationType.None:
                return MusicFontSymbol.None;
            case AccentuationType.Normal:
                return above ? MusicFontSymbol.ArticAccentAbove : MusicFontSymbol.ArticAccentBelow;
            case AccentuationType.Heavy:
                return above ? MusicFontSymbol.ArticMarcatoAbove : MusicFontSymbol.ArticMarcatoBelow;
            case AccentuationType.Tenuto:
                return above ? MusicFontSymbol.ArticTenutoAbove : MusicFontSymbol.ArticTenutoBelow;
            default:
                return MusicFontSymbol.None;
        }
    }

    public override doLayout(): void {
        this.width = 9;
        this.height = 9;
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        const dir = this.renderer.getBeatDirection(this._note.beat);
        const symbol = AccentuationGlyph.getSymbol(this._note.accentuated, dir == BeamDirection.Down);
        
        const padding = 2;
        const y = dir == BeamDirection.Up ? cy + this.y : cy + this.y + this.height - padding;
        canvas.fillMusicFontSymbol(cx + this.x - 2, y, 1, symbol, false);
    }
}
