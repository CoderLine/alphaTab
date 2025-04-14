import type { ICanvas } from '@src/platform/ICanvas';
import { Glyph } from '@src/rendering/glyphs/Glyph';
import { ElementStyleHelper } from '../utils/ElementStyleHelper';
import type { LineBarRenderer } from '../LineBarRenderer';

export class RepeatCloseGlyph extends Glyph {
    public override doLayout(): void {
        this.width = 11;
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        using _ = ElementStyleHelper.bar(
            canvas,
            (this.renderer as LineBarRenderer).repeatsBarSubElement,
            this.renderer.bar
        );

        const blockWidth: number = 4;
        const top: number = cy + this.y + this.renderer.topPadding;
        const bottom: number = cy + this.y + this.renderer.height - this.renderer.bottomPadding;
        let left: number = cx + this.x;
        const h: number = bottom - top;
        // circles
        const circleSize: number = 1.5;
        const middle: number = (top + bottom) / 2;
        const dotOffset: number = 3;
        canvas.fillCircle(left, middle - circleSize * dotOffset, circleSize);
        canvas.fillCircle(left, middle + circleSize * dotOffset, circleSize);
        // line
        left += 4;
        canvas.beginPath();
        canvas.moveTo(left, top);
        canvas.lineTo(left, bottom);
        canvas.stroke();
        // big bar
        left += 3.5;
        canvas.fillRect(left, top, blockWidth, h);
    }
}
