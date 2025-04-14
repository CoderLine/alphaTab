import { ICanvas } from '@src/platform/ICanvas';
import { Glyph } from '@src/rendering/glyphs/Glyph';
import { MusicFontSymbol } from '@src/model/MusicFontSymbol';
import { ElementStyleHelper } from '../utils/ElementStyleHelper';
import { BarSubElement } from '@src/model';
import { MusicFontSymbolSizes } from '../utils/MusicFontSymbolSizes';

export class TabClefGlyph extends Glyph {
    public override doLayout(): void {
        this.width = MusicFontSymbolSizes.Widths.get(MusicFontSymbol.SixStringTabClef)!;
    } 

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        using _ = ElementStyleHelper.bar(canvas, BarSubElement.GuitarTabsClef, this.renderer.bar);

        let strings: number = this.renderer.bar.staff.tuning.length;
        let symbol: MusicFontSymbol =
            strings <= 4 ? MusicFontSymbol.FourStringTabClef : MusicFontSymbol.SixStringTabClef;
        let scale: number = strings <= 4 ? strings / 4.5 : strings / 6.5;
        canvas.fillMusicFontSymbol(cx + this.x + 5, cy + this.y, scale, symbol, false);
    }
}
