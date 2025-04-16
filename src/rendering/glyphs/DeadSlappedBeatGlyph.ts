import type { ICanvas } from '@src/platform/ICanvas';
import { Glyph } from '@src/rendering/glyphs/Glyph';
import type { LineBarRenderer } from '@src/rendering/LineBarRenderer';

export class DeadSlappedBeatGlyph extends Glyph {
    public constructor() {
        super(0, 0);
    }

    public override doLayout(): void {
        this.width = 26;
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        const renderer = this.renderer as LineBarRenderer;
        const crossHeight = renderer.getLineHeight(renderer.heightLineCount - 1);

        const staffTop = renderer.getLineY(0);
        const staffHeight = renderer.getLineHeight(renderer.drawnLineCount - 1);

        // center X on staff
        const centerY = staffTop + staffHeight / 2 - crossHeight / 2;

        const lw = canvas.lineWidth;
        canvas.lineWidth = 2;
        canvas.moveTo(cx + this.x, cy + centerY);
        canvas.lineTo(cx + this.x + this.width, cy + centerY + crossHeight);

        canvas.moveTo(cx + this.x, cy + centerY + crossHeight);
        canvas.lineTo(cx + this.x + this.width, cy + centerY);

        canvas.stroke();

        canvas.lineWidth = lw;
    }
}
