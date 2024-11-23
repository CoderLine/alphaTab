import { MusicFontSymbol } from '@src/model/MusicFontSymbol';
import { WahPedal } from '@src/model/WahPedal';
import { MusicFontGlyph } from './MusicFontGlyph';
import { ICanvas } from '@src/platform';

export class WahPedalGlyph extends MusicFontGlyph {
    public constructor(wahPedal: WahPedal) {
        super(0, 0, 1, WahPedalGlyph.getSymbol(wahPedal));
        this.center = true;
    }
    private static getSymbol(wahPedal: WahPedal): MusicFontSymbol {
        switch (wahPedal) {
            case WahPedal.Open:
                return MusicFontSymbol.GuitarOpenPedal;
            case WahPedal.Closed:
                return MusicFontSymbol.GuitarClosePedal;
        }
        return MusicFontSymbol.None;
    }

    public override doLayout(): void {
        this.width = 11;
        this.height = 11;
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        super.paint(cx, cy + this.height, canvas);
    }
}
