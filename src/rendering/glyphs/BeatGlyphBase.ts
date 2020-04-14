import { Note } from '@src/model/Note';
import { BeatContainerGlyph } from '@src/rendering/glyphs/BeatContainerGlyph';
import { Glyph } from '@src/rendering/glyphs/Glyph';
import { GlyphGroup } from '@src/rendering/glyphs/GlyphGroup';

export class BeatGlyphBase extends GlyphGroup {
    public container!: BeatContainerGlyph;

    public constructor() {
        super(0, 0);
    }

    public doLayout(): void {
        // left to right layout
        let w: number = 0;
        if (this.glyphs) {
            for (let i: number = 0, j: number = this.glyphs.length; i < j; i++) {
                let g: Glyph = this.glyphs[i];
                g.x = w;
                g.renderer = this.renderer;
                g.doLayout();
                w += g.width;
            }
        }
        this.width = w;
    }

    protected noteLoop(action: (note: Note) => void): void {
        for (let i: number = this.container.beat.notes.length - 1; i >= 0; i--) {
            action(this.container.beat.notes[i]);
        }
    }
}
