import { Font } from '@src/model/Font';
import { ICanvas, TextAlign } from '@src/platform/ICanvas';
import { EffectGlyph } from '@src/rendering/glyphs/EffectGlyph';

export class TextGlyph extends EffectGlyph {
    private _lines: string[];
    private _lineHeights: number[] | null = null;

    public font: Font;
    public textAlign: TextAlign;

    public constructor(x: number, y: number, text: string, font: Font, textAlign: TextAlign = TextAlign.Left) {
        super(x, y);
        this._lines = text.split('\n');
        this.font = font;
        this.textAlign = textAlign;
    }

    public override doLayout(): void {
        super.doLayout();

        this._lineHeights = [];
        const c = this.renderer.scoreRenderer.canvas!;
        for (let i = 0; i < this._lines.length; i++) {
            c.font = this.font;
            const h = c!.measureText(this._lines[i]).height * this.scale;
            this._lineHeights[i] = h;
            this.height += h;
        }
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        let color = canvas.color;
        canvas.color = color;
        canvas.font = this.font;
        let old: TextAlign = canvas.textAlign;
        canvas.textAlign = this.textAlign;
        let y: number = cy + this.y;
        for (let i = 0; i < this._lines.length; i++) {
            canvas.fillText(this._lines[i], cx + this.x, y);
            y += this._lineHeights![i];
        }
        canvas.textAlign = old;
    }
}
