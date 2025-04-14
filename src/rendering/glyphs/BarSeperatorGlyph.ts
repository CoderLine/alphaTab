import { ICanvas } from '@src/platform/ICanvas';
import { Glyph } from '@src/rendering/glyphs/Glyph';
import { LineBarRenderer } from '../LineBarRenderer';
import { ElementStyleHelper } from '../utils/ElementStyleHelper';

export class BarSeperatorGlyph extends Glyph {
    private static readonly DashSize: number = 4;

    public override doLayout(): void {
        if (this.renderer.isLast) {
            this.width = 15;
        } else if (
            !this.renderer.nextRenderer ||
            this.renderer.nextRenderer.staff !== this.renderer.staff ||
            !this.renderer.nextRenderer.bar.masterBar.isRepeatStart
        ) {
            this.width = 2;
            if (this.renderer.bar.masterBar.isDoubleBar) {
                this.width += 2;
            }
        } else {
            this.width = 2;
        }
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        const renderer = this.renderer as LineBarRenderer;

        if (renderer.nextRenderer && renderer.nextRenderer.bar.masterBar.isRepeatStart) {
            return;
        }

        using _ = ElementStyleHelper.bar(canvas, renderer.barSeparatorBarSubElement, this.renderer.bar, true);

        let blockWidth: number = 4;
        let top: number = cy + this.y + this.renderer.topPadding;
        let bottom: number = cy + this.y + this.renderer.height - this.renderer.bottomPadding;
        let left: number = cx + this.x;
        let h: number = bottom - top;
        if (this.renderer.isLast) {
            // small bar
            canvas.fillRect(left + this.width - blockWidth - blockWidth, top, 1, h);
            // big bar
            canvas.fillRect(left + this.width - blockWidth, top, blockWidth, h);
        } else if (
            !this.renderer.nextRenderer ||
            this.renderer.nextRenderer.staff !== this.renderer.staff ||
            !this.renderer.nextRenderer.bar.masterBar.isRepeatStart
        ) {
            // small bar
            if (this.renderer.bar.masterBar.isFreeTime) {
                const dashSize: number = BarSeperatorGlyph.DashSize;
                const x = ((left + this.width - 1) | 0) + 0.5;
                const dashes: number = Math.ceil(h / 2 / dashSize);

                canvas.beginPath();
                if (dashes < 1) {
                    canvas.moveTo(x, top);
                    canvas.lineTo(x, bottom);
                } else {
                    let dashY = top;

                    // spread the dashes so they complete directly on the end-Y
                    const freeSpace = h - dashes * dashSize;
                    const freeSpacePerDash = freeSpace / (dashes - 1);

                    while (dashY < bottom) {
                        canvas.moveTo(x, dashY);
                        canvas.lineTo(x, dashY + dashSize);
                        dashY += dashSize + freeSpacePerDash;
                    }
                }
                canvas.stroke();
            } else {
                canvas.fillRect(left + this.width - 1, top, 1, h);
                if (this.renderer.bar.masterBar.isDoubleBar) {
                    canvas.fillRect(left + this.width - 5, top, 1, h);
                }
            }
        }
    }
}
