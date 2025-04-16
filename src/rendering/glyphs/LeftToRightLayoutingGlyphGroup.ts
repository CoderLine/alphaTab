import type { Glyph } from '@src/rendering/glyphs/Glyph';
import { GlyphGroup } from '@src/rendering/glyphs/GlyphGroup';

export class LeftToRightLayoutingGlyphGroup extends GlyphGroup {
    public constructor() {
        super(0, 0);
        this.glyphs = [];
    }

    public override doLayout(): void {
        // skip
    }

    public override addGlyph(g: Glyph): void {
        g.x = this.width;
        g.renderer = this.renderer;
        g.doLayout();
        this.width = g.x + g.width;
        super.addGlyph(g);
    }
}
