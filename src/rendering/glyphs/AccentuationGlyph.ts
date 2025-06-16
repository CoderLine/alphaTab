import { AccentuationType } from '@src/model/AccentuationType';
import { MusicFontSymbol } from '@src/model/MusicFontSymbol';
import type { ICanvas } from '@src/platform/ICanvas';
import type { Note } from '@src/model/Note';
import { EffectGlyph } from '@src/rendering/glyphs/EffectGlyph';
import { BeamDirection } from '@src/rendering/utils/BeamDirection';

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
        this.width = this.renderer.smuflMetrics.GlyphWidths.get(MusicFontSymbol.ArticAccentAbove)!;
        this.height = this.renderer.smuflMetrics.GlyphHeights.get(MusicFontSymbol.ArticAccentAbove)!;
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        const dir = this.renderer.getBeatDirection(this._note.beat);
        const symbol = AccentuationGlyph.getSymbol(this._note.accentuated, dir === BeamDirection.Down);

        const padding = this.renderer.smuflMetrics.accentuationPadding;
        const y = dir === BeamDirection.Up ? cy + this.y : cy + this.y + this.height - padding;
        canvas.fillMusicFontSymbol(cx + this.x - padding, y, 1, symbol, false);
    }
}
