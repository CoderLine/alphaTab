import type { Glyph } from '@coderline/alphatab/rendering/glyphs/Glyph';
import { GlyphGroup } from '@coderline/alphatab/rendering/glyphs/GlyphGroup';
import type { IHeaderRodSink } from '@coderline/alphatab/rendering/staves/HeaderProfile';

/**
 * @internal
 */
export class LeftToRightLayoutingGlyphGroup extends GlyphGroup {
    public gap: number = 0;

    public constructor() {
        super(0, 0);
    }

    public override doLayout(): void {
        // skip
    }

    public override addGlyph(g: Glyph): void {
        g.x = this.width;
        g.renderer = this.renderer;
        g.doLayout();
        this.width = g.x + g.width + this.gap;
        super.addGlyph(g);
    }

    public override registerHeaderRod(info: IHeaderRodSink): void {
        const glyphs = this.glyphs;
        if (glyphs) {
            for (const g of glyphs) {
                g.registerHeaderRod(info);
            }
        }
    }

    public override applyHeaderRod(info: IHeaderRodSink): void {
        const glyphs = this.glyphs;
        if (glyphs) {
            for (const g of glyphs) {
                g.applyHeaderRod(info);
            }
        }
    }
}
