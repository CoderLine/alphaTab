import { NotationElement } from '@coderline/alphatab/NotationSettings';
import { type ICanvas, TextAlign } from '@coderline/alphatab/platform/ICanvas';
import type { RenderingResources } from '@coderline/alphatab/RenderingResources';
import { Glyph } from '@coderline/alphatab/rendering/glyphs/Glyph';
import type { LineBarRenderer } from '@coderline/alphatab/rendering/LineBarRenderer';
import { ElementStyleHelper } from '@coderline/alphatab/rendering/utils/ElementStyleHelper';

/**
 * @internal
 */
export class RepeatCountGlyph extends Glyph {
    private _count: number = 0;
    private _text: string = '';
    private _textWidth: number = 0;
    private static readonly _rightEdgeOffsetFactor: number = 2 / 3;

    public constructor(x: number, y: number, count: number) {
        super(x, y);
        this._count = count;
    }

    public override doLayout(): void {
        this._text = `x${this._count}`;
        this.renderer.scoreRenderer.canvas!.font = this.renderer.resources.elementFonts.get(
            NotationElement.RepeatCount
        )!;
        const size = this.renderer.scoreRenderer.canvas!.measureText(this._text);
        this.width = 0; // do not account width
        this.height = size.height;
        this.y -= size.height;
        this._textWidth = size.width;
    }

    public override getBoundingBoxLeft(): number {
        return this.x - this._textWidth * (1 + RepeatCountGlyph._rightEdgeOffsetFactor);
    }

    public override getBoundingBoxRight(): number {
        return this.x - this._textWidth * RepeatCountGlyph._rightEdgeOffsetFactor;
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        using _ = ElementStyleHelper.bar(
            canvas,
            (this.renderer as LineBarRenderer).repeatsBarSubElement,
            this.renderer.bar
        );

        const res: RenderingResources = this.renderer.resources;
        const oldAlign: TextAlign = canvas.textAlign;
        canvas.font = res.elementFonts.get(NotationElement.RepeatCount)!;
        canvas.textAlign = TextAlign.Right;
        const rightEdgeOffset = this._textWidth * RepeatCountGlyph._rightEdgeOffsetFactor;
        canvas.fillText(this._text, cx + this.x - rightEdgeOffset, cy + this.y);
        canvas.textAlign = oldAlign;
    }
}
