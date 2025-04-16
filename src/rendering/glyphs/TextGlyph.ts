import type { Color } from '@src/model/Color';
import type { Font } from '@src/model/Font';
import { type ICanvas, TextAlign, type TextBaseline } from '@src/platform/ICanvas';
import { EffectGlyph } from '@src/rendering/glyphs/EffectGlyph';

export class TextGlyph extends EffectGlyph {
    private _lines: string[];
    private _lineHeights: number[] | null = null;

    public font: Font;
    public textAlign: TextAlign;
    public textBaseline: TextBaseline | null;

    public colorOverride?: Color;

    public constructor(
        x: number,
        y: number,
        text: string,
        font: Font,
        textAlign: TextAlign = TextAlign.Left,
        testBaseline: TextBaseline | null = null,
        color?: Color
    ) {
        super(x, y);
        this._lines = text.split('\n');
        this.font = font;
        this.textAlign = textAlign;
        this.textBaseline = testBaseline;
        this.colorOverride = color;
    }

    public override doLayout(): void {
        super.doLayout();

        this._lineHeights = [];
        const c = this.renderer.scoreRenderer.canvas!;
        for (const line of this._lines) {
            c.font = this.font;
            const size = c!.measureText(line);
            const h = size.height;
            this._lineHeights.push(h);
            this.height += h;
            this.width = Math.max(this.width, size.width);
        }
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        const color = canvas.color;
        canvas.color = this.colorOverride ?? color;
        canvas.font = this.font;
        const old = canvas.textAlign;
        const oldBaseLine = canvas.textBaseline;
        canvas.textAlign = this.textAlign;
        if (this.textBaseline !== null) {
            canvas.textBaseline = this.textBaseline!;
        }
        let y: number = cy + this.y;
        for (let i = 0; i < this._lines.length; i++) {
            canvas.fillText(this._lines[i], cx + this.x, y);
            y += this._lineHeights![i];
        }
        canvas.textAlign = old;
        canvas.textBaseline = oldBaseLine;
        canvas.color = color;
    }
}
