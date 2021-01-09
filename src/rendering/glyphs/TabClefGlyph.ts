import { ICanvas } from '@src/platform/ICanvas';
import { Glyph } from '@src/rendering/glyphs/Glyph';
import { MusicFontSymbol } from '@src/model/MusicFontSymbol';

export class TabClefGlyph extends Glyph {
    public constructor(x: number, y: number) {
        super(x, y);
    }

    public doLayout(): void {
        this.width = 28 * this.scale;
    }

    public paint(cx: number, cy: number, canvas: ICanvas): void {
        let strings: number = this.renderer.bar.staff.tuning.length;
        let symbol: MusicFontSymbol = strings <= 4 ? MusicFontSymbol.FourStringTabClef : MusicFontSymbol.SixStringTabClef;
        let scale: number = strings <= 4 ? strings / 4.5 : strings / 6.5;
        canvas.fillMusicFontSymbol(
            cx + this.x + 5 * this.scale,
            cy + this.y,
            scale * this.scale,
            symbol,
            false
        );
    }
}
