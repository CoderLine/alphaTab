import { ICanvas, TextAlign } from '@src/platform/ICanvas';
import { Glyph } from '@src/rendering/glyphs/Glyph';
import { RenderingResources } from '@src/RenderingResources';

export class RepeatCountGlyph extends Glyph {
    private _count: number = 0;

    public constructor(x: number, y: number, count: number) {
        super(x, y);
        this._count = 0;
        this._count = count;
    }

    public doLayout(): void {
        this.width = 0;
    }

    public paint(cx: number, cy: number, canvas: ICanvas): void {
        let res: RenderingResources = this.renderer.resources;
        let oldAlign: TextAlign = canvas.textAlign;
        canvas.font = res.barNumberFont;
        canvas.textAlign = TextAlign.Right;
        let s: string = 'x' + this._count;
        let w: number = canvas.measureText(s) / 1.5;
        canvas.fillText(s, cx + this.x - w, cy + this.y);
        canvas.textAlign = oldAlign;
    }
}
