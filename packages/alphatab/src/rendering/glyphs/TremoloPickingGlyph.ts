import { MusicFontSymbol } from '@coderline/alphatab/model/MusicFontSymbol';
import { type TremoloPickingEffect, TremoloPickingStyle } from '@coderline/alphatab/model/TremoloPickingEffect';
import { MusicFontGlyph } from '@coderline/alphatab/rendering/glyphs/MusicFontGlyph';

/**
 * @internal
 */
export class TremoloPickingGlyph extends MusicFontGlyph {
    public constructor(x: number, y: number, effect: TremoloPickingEffect) {
        super(x, y, 1, TremoloPickingGlyph._getSymbol(effect));
    }

    private static _getSymbol(effect: TremoloPickingEffect): MusicFontSymbol {
        if (effect.style === TremoloPickingStyle.BuzzRoll) {
            return MusicFontSymbol.BuzzRoll;
        } else {
            switch (effect.marks) {
                case 1:
                    return MusicFontSymbol.Tremolo1;
                case 2:
                    return MusicFontSymbol.Tremolo2;
                case 3:
                    return MusicFontSymbol.Tremolo3;
                case 4:
                    return MusicFontSymbol.Tremolo4;
                case 5:
                    return MusicFontSymbol.Tremolo5;
                default:
                    return MusicFontSymbol.None;
            }
        }
    }
}
