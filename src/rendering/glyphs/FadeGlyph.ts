import { FadeType } from '@src/model/FadeType';
import { MusicFontGlyph } from './MusicFontGlyph';
import { MusicFontSymbol } from '@src/model';
import { ICanvas } from '@src/platform';

export class FadeGlyph extends MusicFontGlyph {
    public constructor(type: FadeType) {
        super(0, 0, 1, FadeGlyph.getSymbol(type));
        this.center = true;
    }
    private static getSymbol(type: FadeType): MusicFontSymbol {
        switch (type) {
            case FadeType.FadeIn:
                return MusicFontSymbol.GuitarFadeIn;
            case FadeType.FadeOut:
                return MusicFontSymbol.GuitarFadeOut;
            case FadeType.VolumeSwell:
                return MusicFontSymbol.GuitarVolumeSwell;
        }
        return MusicFontSymbol.None;
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        super.paint(cx, cy + this.height, canvas)
    }
}
