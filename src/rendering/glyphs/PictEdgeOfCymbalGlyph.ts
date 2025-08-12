import { MusicFontGlyph } from '@src/rendering/glyphs/MusicFontGlyph';
import { MusicFontSymbol } from '@src/model/MusicFontSymbol';

export class PictEdgeOfCymbalGlyph extends MusicFontGlyph {
    public constructor(x: number, y: number) {
        super(x, y, 0.5, MusicFontSymbol.PictEdgeOfCymbal);
        this.center = true;
    }

    public override doLayout(): void {
        super.doLayout();
        this.offsetY = this.height;
    }
}
