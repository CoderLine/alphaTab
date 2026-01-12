import { MusicFontSymbol } from '@coderline/alphatab/model/MusicFontSymbol';
import type { ICanvas } from '@coderline/alphatab/platform/ICanvas';
import { Glyph } from '@coderline/alphatab/rendering/glyphs/Glyph';
import type { LineBarRenderer } from '@coderline/alphatab/rendering/LineBarRenderer';

/**
 * @internal
 */
export class DeadSlappedBeatGlyph extends Glyph {
    private _topY = 0;
    public constructor() {
        super(0, 0);
    }

    public override getBoundingBoxTop(): number {
        return this._topY;
    }

    public override getBoundingBoxBottom(): number {
        return this._topY + this.height;
    }

    public override doLayout(): void {
        this.width = this.renderer.smuflMetrics.glyphWidths.get(MusicFontSymbol.NoteheadSlashWhiteHalf)!;

        const renderer = this.renderer as LineBarRenderer;
        const crossHeight = renderer.getLineHeight(renderer.heightLineCount - 1);

        const staffTop = renderer.getLineY(0);
        const staffHeight = renderer.drawnLineCount > 0 ? renderer.getLineHeight(renderer.drawnLineCount - 1) : 0;

        const topY = staffTop + staffHeight / 2 - crossHeight / 2;

        this.height = crossHeight;

        this._topY = topY;
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        const crossHeight = this.height;

        const topY = this._topY;

        const lw = canvas.lineWidth;
        canvas.lineWidth = this.renderer.smuflMetrics.deadSlappedLineWidth;
        canvas.moveTo(cx + this.x, cy + topY);
        canvas.lineTo(cx + this.x + this.width, cy + topY + crossHeight);

        canvas.moveTo(cx + this.x, cy + topY + crossHeight);
        canvas.lineTo(cx + this.x + this.width, cy + topY);

        canvas.stroke();

        canvas.lineWidth = lw;
    }
}
