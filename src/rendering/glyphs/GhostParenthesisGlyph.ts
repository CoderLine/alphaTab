import { ICanvas } from '@src/platform/ICanvas';
import { Glyph } from '@src/rendering/glyphs/Glyph';
import { TieGlyph } from '@src/rendering/glyphs/TieGlyph';

export class GhostParenthesisGlyph extends Glyph {
    private static readonly Size: number = 6;
    private _isOpen: boolean;

    public constructor(isOpen: boolean) {
        super(0, 0);
        this._isOpen = isOpen;
    }

    public doLayout(): void {
        super.doLayout();
        this.width = GhostParenthesisGlyph.Size * this.scale;
    }

    public paint(cx: number, cy: number, canvas: ICanvas): void {
        if (this._isOpen) {
            TieGlyph.paintTie(
                canvas,
                this.scale,
                cx + this.x + this.width,
                cy + this.y + this.height,
                cx + this.x + this.width,
                cy + this.y,
                false,
                6,
                3
            );
        } else {
            TieGlyph.paintTie(
                canvas,
                this.scale,
                cx + this.x,
                cy + this.y,
                cx + this.x,
                cy + this.y + this.height,
                false,
                6,
                3
            );
        }
    }
}
