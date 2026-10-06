import { MusicFontSymbol } from '@coderline/alphatab/model/MusicFontSymbol';
import { ClefGlyph } from '@coderline/alphatab/rendering/glyphs/ClefGlyph';
import { MusicFontGlyph } from '@coderline/alphatab/rendering/glyphs/MusicFontGlyph';
import type { BarLayoutingInfo } from '@coderline/alphatab/rendering/staves/BarLayoutingInfo';

/**
 * @internal
 */
export class TabClefGlyph extends MusicFontGlyph {
    constructor(x: number, y: number) {
        super(x, y, 1, MusicFontSymbol.SixStringTabClef);
    }
    public override doLayout(): void {
        this.symbol =
            this.renderer.bar.staff.tuning.length <= 4
                ? MusicFontSymbol.FourStringTabClef
                : MusicFontSymbol.SixStringTabClef;
        this.center = true;
        super.doLayout();
        this.width = this.renderer.smuflMetrics.glyphWidths.get(MusicFontSymbol.GClef)!;
        this.offsetX = this.width / 2;
    }

    public override registerHeaderRod(info: BarLayoutingInfo): void {
        // shares the column with the standard notation clefs, left aligned
        info.addHeaderRod(ClefGlyph.HeaderRank, 0, this.width + this.renderer.smuflMetrics.preBeatGlyphSpacing);
    }

    public override applyHeaderRod(info: BarLayoutingInfo): void {
        this.x = info.getHeaderRodX(ClefGlyph.HeaderRank, 0);
    }
}
