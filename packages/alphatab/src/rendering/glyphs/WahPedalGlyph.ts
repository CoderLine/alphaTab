import { MusicFontSymbol } from '@coderline/alphatab/model/MusicFontSymbol';
import { WahPedal } from '@coderline/alphatab/model/WahPedal';
import { MusicFontGlyph } from '@coderline/alphatab/rendering/glyphs/MusicFontGlyph';
import type { ICanvas } from '@coderline/alphatab/platform/ICanvas';

/**
 * @internal
 */
export class WahPedalGlyph extends MusicFontGlyph {
    public constructor(wahPedal: WahPedal) {
        super(0, 0, 1, WahPedalGlyph._getSymbol(wahPedal));
        this.center = true;
    }
    private static _getSymbol(wahPedal: WahPedal): MusicFontSymbol {
        switch (wahPedal) {
            case WahPedal.Open:
                return MusicFontSymbol.GuitarOpenPedal;
            case WahPedal.Closed:
                return MusicFontSymbol.GuitarClosePedal;
        }
        return MusicFontSymbol.None;
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        super.paint(cx, cy + this.height, canvas);
    }
}
