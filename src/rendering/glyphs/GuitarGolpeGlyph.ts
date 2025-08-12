import { MusicFontSymbol } from '@src/model/MusicFontSymbol';
import { NoteHeadGlyph } from '@src/rendering/glyphs/NoteHeadGlyph';
import { MusicFontGlyph } from '@src/rendering/glyphs/MusicFontGlyph';

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
