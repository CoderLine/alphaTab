import { ICanvas } from '@src/platform';
import { Glyph } from './Glyph';
import { NumberedBarRenderer } from '../NumberedBarRenderer';

export class NumberedDashGlyph extends Glyph {
    private static Padding = 3;
    public override doLayout(): void {
        this.width = (14 + NumberedDashGlyph.Padding) * this.scale;
        this.height = NumberedBarRenderer.BarSize * this.scale;
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        const padding = NumberedDashGlyph.Padding * this.scale;
        canvas.fillRect(cx + this.x, cy + this.y, this.width - padding, this.height);
    }
}
