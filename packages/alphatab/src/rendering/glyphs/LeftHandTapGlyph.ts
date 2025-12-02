import { MusicFontSymbol } from '@coderline/alphatab/model/MusicFontSymbol';
import { MusicFontGlyph } from '@coderline/alphatab/rendering/glyphs/MusicFontGlyph';

/**
 * @internal
 */
export class LeftHandTapGlyph extends MusicFontGlyph {
    public constructor() {
        super(0, 0, 1, MusicFontSymbol.GuitarLeftHandTapping);
        this.center = true;
    }

    public override doLayout(): void {
        super.doLayout();
        this.offsetY = this.renderer.smuflMetrics.glyphTop.get(this.symbol)!;
    }
}
