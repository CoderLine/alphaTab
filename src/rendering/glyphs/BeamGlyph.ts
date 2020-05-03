import { Duration } from '@src/model/Duration';
import { MusicFontGlyph } from '@src/rendering/glyphs/MusicFontGlyph';
import { MusicFontSymbol } from '@src/rendering/glyphs/MusicFontSymbol';
import { BeamDirection } from '@src/rendering/utils/BeamDirection';
import { NoteHeadGlyph } from '@src/rendering/glyphs/NoteHeadGlyph';

export class BeamGlyph extends MusicFontGlyph {
    public constructor(x: number, y: number, duration: Duration, direction: BeamDirection, isGrace: boolean) {
        super(x, y, isGrace ? NoteHeadGlyph.GraceScale : 1, BeamGlyph.getSymbol(duration, direction, isGrace));
    }

    public doLayout(): void {
        this.width = 0;
    }

    private static getSymbol(duration: Duration, direction: BeamDirection, isGrace: boolean): MusicFontSymbol {
        if (isGrace) {
            duration = Duration.Eighth;
        }
        if (direction === BeamDirection.Up) {
            switch (duration) {
                case Duration.Eighth:
                    return MusicFontSymbol.FooterUpEighth;
                case Duration.Sixteenth:
                    return MusicFontSymbol.FooterUpSixteenth;
                case Duration.ThirtySecond:
                    return MusicFontSymbol.FooterUpThirtySecond;
                case Duration.SixtyFourth:
                    return MusicFontSymbol.FooterUpSixtyFourth;
                case Duration.OneHundredTwentyEighth:
                    return MusicFontSymbol.FooterUpOneHundredTwentyEighth;
                case Duration.TwoHundredFiftySixth:
                    return MusicFontSymbol.FooterUpTwoHundredFiftySixth;
                default:
                    return MusicFontSymbol.FooterUpEighth;
            }
        }
        switch (duration) {
            case Duration.Eighth:
                return MusicFontSymbol.FooterDownEighth;
            case Duration.Sixteenth:
                return MusicFontSymbol.FooterDownSixteenth;
            case Duration.ThirtySecond:
                return MusicFontSymbol.FooterDownThirtySecond;
            case Duration.SixtyFourth:
                return MusicFontSymbol.FooterDownSixtyFourth;
            case Duration.OneHundredTwentyEighth:
                return MusicFontSymbol.FooterDownOneHundredTwentyEighth;
            case Duration.TwoHundredFiftySixth:
                return MusicFontSymbol.FooterDownOneHundredTwentyEighth;
            default:
                return MusicFontSymbol.FooterDownEighth;
        }
    }
}
