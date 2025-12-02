import { MusicFontSymbol } from '@coderline/alphatab/model/MusicFontSymbol';
import { NoteHeadGlyph } from '@coderline/alphatab/rendering/glyphs/NoteHeadGlyph';
import { MusicFontGlyph } from '@coderline/alphatab/rendering/glyphs/MusicFontGlyph';

/**
 * @internal
 */
export class GuitarGolpeGlyph extends MusicFontGlyph {
    public constructor(x: number, y: number, center: boolean = false) {
        super(x, y, NoteHeadGlyph.GraceScale, MusicFontSymbol.GuitarGolpe);
        this.center = center;
    }

    public override doLayout(): void {
        super.doLayout();
        this.offsetY = this.height;
    }
}
