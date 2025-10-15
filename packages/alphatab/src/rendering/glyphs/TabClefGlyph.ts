import { MusicFontSymbol } from '@src/model/MusicFontSymbol';
import { MusicFontGlyph } from '@src/rendering/glyphs/MusicFontGlyph';

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
}
