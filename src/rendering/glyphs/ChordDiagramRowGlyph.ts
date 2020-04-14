import { ChordDiagramGlyph } from '@src/rendering/glyphs/ChordDiagramGlyph';
import { GlyphGroup } from '@src/rendering/glyphs/GlyphGroup';

export class ChordDiagramRowGlyph extends GlyphGroup {
    private _glyphWidth: number = 0;
    public height: number = 0;

    public constructor(x: number, y: number) {
        super(x, y);
        this.glyphs = [];
    }

    public doLayout(): void {
        let x: number = (this.width - this._glyphWidth) / 2;
        for (let glyph of this.glyphs!) {
            glyph.x = x;
            x += glyph.width;
        }
    }

    public addChord(chord: ChordDiagramGlyph): void {
        this.glyphs!.push(chord);
        this._glyphWidth += chord.width;
        if (chord.height > this.height) {
            this.height = chord.height;
        }
    }
}
