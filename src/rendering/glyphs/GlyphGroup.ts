import type { ICanvas } from '@src/platform/ICanvas';
import { Glyph } from '@src/rendering/glyphs/Glyph';

/**
 * This glyph allows to group several other glyphs to be
 * drawn at the same x position
 */
export class GlyphGroup extends Glyph {
    protected glyphs: Glyph[] | null = null;

    public get isEmpty(): boolean {
        return !this.glyphs || this.glyphs.length === 0;
    }

    public override doLayout(): void {
        if (!this.glyphs || this.glyphs.length === 0) {
            this.width = 0;
            return;
        }
        let w: number = 0;
        for (let i: number = 0, j: number = this.glyphs.length; i < j; i++) {
            const g: Glyph = this.glyphs[i];
            g.renderer = this.renderer;
            g.doLayout();
            w = Math.max(w, g.width);
        }
        this.width = w;
    }

    public addGlyph(g: Glyph): void {
        if (!this.glyphs) {
            this.glyphs = [];
        }
        if (this.renderer) {
            g.renderer = this.renderer;
        }
        this.glyphs.push(g);
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        const glyphs = this.glyphs;
        if (!glyphs || glyphs.length === 0) {
            return;
        }
        for (const g of glyphs) {
            g.paint(cx + this.x, cy + this.y, canvas);
        }
    }
}
