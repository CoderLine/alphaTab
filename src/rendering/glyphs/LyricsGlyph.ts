import { Font } from '@src/model/Font';
import { ICanvas, TextAlign } from '@src/platform/ICanvas';
import { EffectGlyph } from '@src/rendering/glyphs/EffectGlyph';

export class LyricsGlyph extends EffectGlyph {
    private _lines: string[];

    public font: Font;
    public textAlign: TextAlign;

    public constructor(x: number, y: number, lines: string[], font: Font, textAlign: TextAlign = TextAlign.Center) {
        super(x, y);
        this._lines = lines;
        this.font = font;
        this.textAlign = textAlign;
    }

    public doLayout(): void {
        super.doLayout();
        this.height = this.font.size * this._lines.length;
    }

    public paint(cx: number, cy: number, canvas: ICanvas): void {
        canvas.font = this.font;
        let old: TextAlign = canvas.textAlign;
        canvas.textAlign = this.textAlign;
        for (let i: number = 0; i < this._lines.length; i++) {
            if (this._lines[i]) {
                canvas.fillText(this._lines[i], cx + this.x, cy + this.y + i * this.font.size);
            }
        }
        canvas.textAlign = old;
    }
}
