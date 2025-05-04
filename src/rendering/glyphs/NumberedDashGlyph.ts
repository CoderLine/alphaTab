import { Glyph } from '@src/rendering/glyphs/Glyph';
import { NumberedBarRenderer } from '@src/rendering/NumberedBarRenderer';
import { ElementStyleHelper } from '@src/rendering/utils/ElementStyleHelper';
import { type Beat, BeatSubElement } from '@src/model/Beat';
import type { ICanvas } from '@src/platform/ICanvas';

export class NumberedDashGlyph extends Glyph {
    private static Padding = 3;
    private _beat: Beat;

    public constructor(x: number, y: number, beat: Beat) {
        super(x, y);
        this._beat = beat;
    }

    public override doLayout(): void {
        this.width = 14 + NumberedDashGlyph.Padding;
        this.height = NumberedBarRenderer.BarSize;
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        using _ = ElementStyleHelper.beat(canvas, BeatSubElement.NumberedDuration, this._beat);
        const padding = NumberedDashGlyph.Padding;
        canvas.fillRect(cx + this.x, cy + this.y, this.width - padding, this.height);
    }
}
