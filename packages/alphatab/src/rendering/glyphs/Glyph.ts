import type { ICanvas } from '@coderline/alphatab/platform/ICanvas';
import type { BarRendererBase } from '@coderline/alphatab/rendering/BarRendererBase';

/**
 * A glyph is a single symbol which can be added to a GlyphBarRenderer for automated
 * layouting and drawing of stacked symbols.
 * @internal
 */
export class Glyph {
    public x: number;
    public y: number;
    public width: number = 0;
    public height: number = 0;
    public renderer!: BarRendererBase;

    public constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    public getBoundingBoxTop() {
        return this.y;
    }

    public getBoundingBoxBottom() {
        return this.getBoundingBoxTop() + this.height;
    }

    /**
     * Paint extent — distinct from the rhythmic-spacing extent (`x`, `x + width`).
     * Override on zero-width "no-rod" glyphs so the bar-local skyline still sees them.
     */
    public getBoundingBoxLeft(): number {
        return this.x;
    }

    public getBoundingBoxRight(): number {
        return this.x + this.width;
    }

    public doLayout(): void {
        // to be implemented in subclass
    }

    /** Hook for glyphs whose bbox is only final after `scaleToWidth`. Default no-op. */
    public populateSkyline(): void {
        // to be implemented in subclass
    }

    public paint(_cx: number, _cy: number, _canvas: ICanvas): void {
        // to be implemented in subclass
    }
}
