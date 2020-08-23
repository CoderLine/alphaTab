import { Font } from '@src/model/Font';
import { ICanvas, TextAlign } from '@src/platform/ICanvas';
import { EffectGlyph } from '@src/rendering/glyphs/EffectGlyph';

export class TextGlyph extends EffectGlyph {
    private _lines: string[];

    public font: Font;
    public textAlign: TextAlign;

    public constructor(x: number, y: number, text: string, font: Font, textAlign: TextAlign = TextAlign.Left) {
        super(x, y);
        this._lines = text.split('\n');
        this.font = font;
        this.textAlign = textAlign;
    }

    public doLayout(): void {
        super.doLayout();
        this.height = this.font.size * this._lines.length;
    }

    public paint(cx: number, cy: number, canvas: ICanvas): void {
        let color = canvas.color ;
        canvas.color = color;
        canvas.font = this.font;
        let old: TextAlign = canvas.textAlign;
        canvas.textAlign = this.textAlign;
        let y: number = cy + this.y;
        for (let line of this._lines) {
            canvas.fillText(line, cx + this.x, y);
            y += this.font.size;
        }
        canvas.textAlign = old;
    }
}
