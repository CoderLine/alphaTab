import type { Color } from '@src/model/Color';
import type { ICanvas } from '@src/platform/ICanvas';
import { Glyph } from '@src/rendering/glyphs/Glyph';

export class CircleGlyph extends Glyph {
    private _size: number = 0;

    public colorOverride?: Color;

    public constructor(x: number, y: number, size: number) {
        super(x, y);
        this._size = size;
    }

    public override doLayout(): void {
        this.width = this._size + 3;
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        const c = canvas.color;
        if (this.colorOverride) {
            canvas.color = this.colorOverride;
        }
        canvas.fillCircle(cx + this.x, cy + this.y, this._size);
        canvas.color = c;
    }
}
