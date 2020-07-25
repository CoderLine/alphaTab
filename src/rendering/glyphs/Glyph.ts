import { ICanvas } from '@src/platform/ICanvas';
import { BarRendererBase } from '@src/rendering/BarRendererBase';

/**
 * A glyph is a single symbol which can be added to a GlyphBarRenderer for automated
 * layouting and drawing of stacked symbols.
 */
export class Glyph {
    public x: number = 0;
    public y: number = 0;
    public width: number = 0;
    public renderer!: BarRendererBase;

    public constructor(x: number = 0, y: number = 0) {
        this.x = x;
        this.y = y;
    }

    public get scale(): number {
        return this.renderer.scale;
    }

    public doLayout(): void {
        // to be implemented in subclass
    }

    public paint(cx: number, cy: number, canvas: ICanvas): void {
        // to be implemented in subclass
    }
}
