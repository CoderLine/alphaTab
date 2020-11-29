import { Duration } from '@src/model/Duration';
import { MusicFontGlyph } from '@src/rendering/glyphs/MusicFontGlyph';
import { MusicFontSymbol } from '@src/model/MusicFontSymbol';
import { BeamDirection } from '@src/rendering/utils/BeamDirection';
import { NoteHeadGlyph } from '@src/rendering/glyphs/NoteHeadGlyph';

export class FlagGlyph extends MusicFontGlyph {
    public static readonly FlagWidth:number = 11;

    public constructor(x: number, y: number, duration: Duration, direction: BeamDirection, isGrace: boolean) {
        super(x, y, isGrace ? NoteHeadGlyph.GraceScale : 1, FlagGlyph.getSymbol(duration, direction, isGrace));
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
                    return MusicFontSymbol.FlagEighthUp;
                case Duration.Sixteenth:
                    return MusicFontSymbol.FlagSixteenthUp;
                case Duration.ThirtySecond:
                    return MusicFontSymbol.FlagThirtySecondUp;
                case Duration.SixtyFourth:
                    return MusicFontSymbol.FlagSixtyFourthUp;
                case Duration.OneHundredTwentyEighth:
                    return MusicFontSymbol.FlagOneHundredTwentyEighthUp;
                case Duration.TwoHundredFiftySixth:
                    return MusicFontSymbol.FlagTwoHundredFiftySixthUp;
                default:
                    return MusicFontSymbol.FlagEighthUp;
            }
        }
        switch (duration) {
            case Duration.Eighth:
                return MusicFontSymbol.FlagEighthDown;
            case Duration.Sixteenth:
                return MusicFontSymbol.FlagSixteenthDown;
            case Duration.ThirtySecond:
                return MusicFontSymbol.FlagThirtySecondDown;
            case Duration.SixtyFourth:
                return MusicFontSymbol.FlagSixtyFourthDown;
            case Duration.OneHundredTwentyEighth:
                return MusicFontSymbol.FlagOneHundredTwentyEighthDown;
            case Duration.TwoHundredFiftySixth:
                return MusicFontSymbol.FlagOneHundredTwentyEighthDown;
            default:
                return MusicFontSymbol.FlagEighthDown;
        }
    }
}
