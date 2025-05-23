import { Color } from '@src/model/Color';
import type { ICanvas } from '@src/platform/ICanvas';
import { EffectGlyph } from '@src/rendering/glyphs/EffectGlyph';

export class DummyEffectGlyph extends EffectGlyph {
    private _w: number;
    private _h: number;

    public constructor(x: number, y: number, w: number = 20, h: number = 20) {
        super(x, y);
        this._w = w;
        this._h = h;
    }

    public override doLayout(): void {
        this.width = this._w;
        this.height = this._h;
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        const c = canvas.color;
        canvas.color = Color.random();
        canvas.fillRect(cx + this.x, cy + this.y, this.width, this.height);
        canvas.color = c;
    }
}
