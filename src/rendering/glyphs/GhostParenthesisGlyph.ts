import type { Color } from '@src/model/Color';
import type { ICanvas } from '@src/platform/ICanvas';
import { Glyph } from '@src/rendering/glyphs/Glyph';
import { TieGlyph } from '@src/rendering/glyphs/TieGlyph';

export class GhostParenthesisGlyph extends Glyph {
    private static readonly Size: number = 6;
    private _isOpen: boolean;

    public colorOverride?: Color;

    public constructor(isOpen: boolean) {
        super(0, 0);
        this._isOpen = isOpen;
    }

    public override doLayout(): void {
        super.doLayout();
        this.width = GhostParenthesisGlyph.Size;
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
                cx + this.x + this.width,
                cy + this.y + this.height,
                cx + this.x + this.width,
                cy + this.y,
                false,
                6,
                3
            );
        } else {
            TieGlyph.paintTie(canvas, 1, cx + this.x, cy + this.y, cx + this.x, cy + this.y + this.height, false, 6, 3);
        }
        canvas.color = c;
    }
}
