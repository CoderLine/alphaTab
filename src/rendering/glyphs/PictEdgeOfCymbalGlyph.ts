import { ICanvas } from '@src/platform/ICanvas';
import { MusicFontGlyph } from '@src/rendering/glyphs/MusicFontGlyph';
import { MusicFontSymbol } from '@src/model/MusicFontSymbol';

export class PictEdgeOfCymbalGlyph extends MusicFontGlyph {
    public constructor(x: number, y: number) {
        super(x, y, 0.5, MusicFontSymbol.PictEdgeOfCymbal);
    }

    public doLayout(): void {
        this.width = 22 * this.scale;
        this.height = 15 * this.scale;
    }

    public paint(cx: number, cy: number, canvas: ICanvas): void {
        super.paint(cx - 3 * this.scale, cy + this.height, canvas);
    }
}
