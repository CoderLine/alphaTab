import { ICanvas } from '@src/platform/ICanvas';
import { Glyph } from '@src/rendering/glyphs/Glyph';

export class BarSeperatorGlyph extends Glyph {
    public constructor(x: number, y: number) {
        super(x, y);
    }

    public doLayout(): void {
        if (this.renderer.isLast) {
            this.width = 15 * this.scale;
        } else if (
            !this.renderer.nextRenderer ||
            this.renderer.nextRenderer.staff !== this.renderer.staff ||
            !this.renderer.nextRenderer.bar.masterBar.isRepeatStart
        ) {
            this.width = 2 * this.scale;
            if (this.renderer.bar.masterBar.isDoubleBar) {
                this.width += 2 * this.scale;
            }
        } else {
            this.width = 2 * this.scale;
        }
    }

    public paint(cx: number, cy: number, canvas: ICanvas): void {
        let blockWidth: number = 4 * this.scale;
        let top: number = cy + this.y + this.renderer.topPadding;
        let bottom: number = cy + this.y + this.renderer.height - this.renderer.bottomPadding;
        let left: number = cx + this.x;
        let h: number = bottom - top;
        if (this.renderer.isLast) {
            // small bar
            canvas.fillRect(left + this.width - blockWidth - blockWidth, top, this.scale, h);
            // big bar
            canvas.fillRect(left + this.width - blockWidth, top, blockWidth, h);
        } else if (
            !this.renderer.nextRenderer ||
            this.renderer.nextRenderer.staff !== this.renderer.staff ||
            !this.renderer.nextRenderer.bar.masterBar.isRepeatStart
        ) {
            // small bar
            canvas.fillRect(left + this.width - this.scale, top, this.scale, h);
            if (this.renderer.bar.masterBar.isDoubleBar) {
                canvas.fillRect(left + this.width - 5 * this.scale, top, this.scale, h);
            }
        }
    }
}
