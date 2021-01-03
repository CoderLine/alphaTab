import { ICanvas } from '@src/platform/ICanvas';
import { BarRendererBase } from '@src/rendering/BarRendererBase';

/**
 * A glyph is a single symbol which can be added to a GlyphBarRenderer for automated
 * layouting and drawing of stacked symbols.
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
