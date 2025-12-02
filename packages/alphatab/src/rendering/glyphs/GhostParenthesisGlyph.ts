import type { Color } from '@coderline/alphatab/model/Color';
import type { ICanvas } from '@coderline/alphatab/platform/ICanvas';
import { Glyph } from '@coderline/alphatab/rendering/glyphs/Glyph';
import { TieGlyph } from '@coderline/alphatab/rendering/glyphs/TieGlyph';

/**
 * @internal
 */
export class GhostParenthesisGlyph extends Glyph {
    private _isOpen: boolean;

    public colorOverride?: Color;

    public constructor(isOpen: boolean) {
        super(0, 0);
        this._isOpen = isOpen;
    }

    public override doLayout(): void {
        super.doLayout();
        this.width =
            this.renderer.smuflMetrics.ghostParenthesisWidth + this.renderer.smuflMetrics.ghostParenthesisPadding;
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        const c = canvas.color;
        if (this.colorOverride) {
            canvas.color = this.colorOverride;
        }

        if (this._isOpen) {
            TieGlyph.paintTie(
                canvas,
                1,
                cx + this.x + this.renderer.smuflMetrics.ghostParenthesisWidth,
                cy + this.y + this.height,
                cx + this.x + this.renderer.smuflMetrics.ghostParenthesisWidth,
                cy + this.y,
                false,
                this.renderer.smuflMetrics.ghostParenthesisWidth / 2,
                this.renderer.smuflMetrics.tieMidpointThickness
            );
        } else {
            TieGlyph.paintTie(
                canvas,
                1,
                cx + this.x + this.renderer.smuflMetrics.ghostParenthesisPadding,
                cy + this.y,
                cx + this.x + this.renderer.smuflMetrics.ghostParenthesisPadding,
                cy + this.y + this.height,
                false,
                this.renderer.smuflMetrics.ghostParenthesisWidth / 2,
                this.renderer.smuflMetrics.tieMidpointThickness
            );
        }
        canvas.color = c;
    }
}
