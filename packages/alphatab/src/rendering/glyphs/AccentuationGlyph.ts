import { AccentuationType } from '@coderline/alphatab/model/AccentuationType';
import { MusicFontSymbol } from '@coderline/alphatab/model/MusicFontSymbol';
import { CanvasHelper, type ICanvas } from '@coderline/alphatab/platform/ICanvas';
import type { Note } from '@coderline/alphatab/model/Note';
import { EffectGlyph } from '@coderline/alphatab/rendering/glyphs/EffectGlyph';
import { BeamDirection } from '@coderline/alphatab/rendering/utils/BeamDirection';

/**
 * @internal
 */
export class AccentuationGlyph extends EffectGlyph {
    private _note: Note;
    public constructor(x: number, y: number, note: Note) {
        super(x, y);
        this._note = note;
    }

    private static _getSymbol(accentuation: AccentuationType, above: boolean): MusicFontSymbol {
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
        this.width = this.renderer.smuflMetrics.glyphWidths.get(MusicFontSymbol.ArticAccentAbove)!;
        this.height = this.renderer.smuflMetrics.glyphHeights.get(MusicFontSymbol.ArticAccentAbove)!;
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        const dir = this.renderer.getBeatDirection(this._note.beat);
        const symbol = AccentuationGlyph._getSymbol(this._note.accentuated, dir === BeamDirection.Down);

        const y = dir === BeamDirection.Up ? cy + this.y : cy + this.y + this.height;
        CanvasHelper.fillMusicFontSymbolSafe(canvas,cx + this.x, y, 1, symbol, true);
    }
}
