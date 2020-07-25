import { ICanvas } from '@src/platform/ICanvas';
import { Glyph } from '@src/rendering/glyphs/Glyph';

export class RepeatOpenGlyph extends Glyph {
    private _dotOffset: number = 0;
    private _circleSize: number = 0;

    public constructor(x: number, y: number, circleSize: number, dotOffset: number) {
        super(x, y);
        this._dotOffset = 0.0;
        this._circleSize = 0.0;
        this._dotOffset = dotOffset;
        this._circleSize = circleSize;
    }

    public doLayout(): void {
        this.width = 13 * this.scale;
    }

    public paint(cx: number, cy: number, canvas: ICanvas): void {
        let blockWidth: number = 4 * this.scale;
        let top: number = cy + this.y + this.renderer.topPadding;
        let bottom: number = cy + this.y + this.renderer.height - this.renderer.bottomPadding;
        let left: number = cx + this.x + 0.5;
        // big bar
        let h: number = bottom - top;
        canvas.fillRect(left, top, blockWidth, h);
        // line
        left += blockWidth * 2 - 0.5;
        canvas.beginPath();
        canvas.moveTo(left, top);
        canvas.lineTo(left, bottom);
        canvas.stroke();
        // circles
        left += 3 * this.scale;
        let circleSize: number = this._circleSize * this.scale;
        let middle: number = (top + bottom) / 2;
        canvas.fillCircle(left, middle - circleSize * this._dotOffset, circleSize);
        canvas.fillCircle(left, middle + circleSize * this._dotOffset, circleSize);
    }
}
