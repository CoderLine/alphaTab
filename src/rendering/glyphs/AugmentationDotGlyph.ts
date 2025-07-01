import { MusicFontSymbol } from '@src/model/MusicFontSymbol';
import type { ICanvas } from '@src/platform/ICanvas';
import { MusicFontGlyph } from '@src/rendering/glyphs/MusicFontGlyph';

export class AugmentationDotGlyph extends MusicFontGlyph {
    public constructor(x: number, y: number) {
        super(x, y, 1, MusicFontSymbol.AugmentationDot);
    }

    public override doLayout(): void {
        super.doLayout();
        this.width *= 1.5;
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        if(!this.center) {
            cx += this.width / 1.5;
        }
        super.paint(cx, cy, canvas);
    }
}
