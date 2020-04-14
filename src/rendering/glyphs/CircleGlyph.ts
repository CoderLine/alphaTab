import { ICanvas } from '@src/platform/ICanvas';
import { Glyph } from '@src/rendering/glyphs/Glyph';

export class CircleGlyph extends Glyph {
    private _size: number = 0;

    public constructor(x: number, y: number, size: number) {
        super(x, y);
        this._size = size;
    }

    public doLayout(): void {
        this.width = this._size + 3 * this.scale;
    }

    public paint(cx: number, cy: number, canvas: ICanvas): void {
        canvas.fillCircle(cx + this.x, cy + this.y, this._size);
    }
}
