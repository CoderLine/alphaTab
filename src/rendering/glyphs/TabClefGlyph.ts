import type { ICanvas } from '@src/platform/ICanvas';
import { Glyph } from '@src/rendering/glyphs/Glyph';
import { MusicFontSymbol } from '@src/model/MusicFontSymbol';
import { ElementStyleHelper } from '@src/rendering/utils/ElementStyleHelper';
import { BarSubElement } from '@src/model/Bar';

export class TabClefGlyph extends Glyph {
    public override doLayout(): void {
        this.width = this.renderer.smuflMetrics.glyphWidths.get(MusicFontSymbol.SixStringTabClef)!;
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        using _ = ElementStyleHelper.bar(canvas, BarSubElement.GuitarTabsClef, this.renderer.bar);

        const [symbol, scale] = this.renderer.smuflMetrics.stringsToTabClefSymbolAndScale(
            this.renderer.bar.staff.tuning.length
        );
        canvas.fillMusicFontSymbol(cx + this.x + this.renderer.smuflMetrics.tabClefOffsetX, cy + this.y, scale, symbol, false);
    }
}
