import { Duration } from '@src/model/Duration';
import { MusicFontGlyph } from '@src/rendering/glyphs/MusicFontGlyph';
import { MusicFontSymbol } from '@src/model/MusicFontSymbol';
import { BeamDirection } from '@src/rendering/utils/BeamDirection';
import { NoteHeadGlyph } from '@src/rendering/glyphs/NoteHeadGlyph';

export class FlagGlyph extends MusicFontGlyph {
    public constructor(x: number, y: number, duration: Duration, direction: BeamDirection, isGrace: boolean) {
        super(x, y, isGrace ? NoteHeadGlyph.GraceScale : 1, FlagGlyph.getSymbol(duration, direction, isGrace));
    }

    private static getSymbol(duration: Duration, direction: BeamDirection, isGrace: boolean): MusicFontSymbol {
        if (isGrace) {
            duration = Duration.Eighth;
        }
        if (direction === BeamDirection.Up) {
            switch (duration) {
                case Duration.Eighth:
                    return MusicFontSymbol.Flag8thUp;
                case Duration.Sixteenth:
                    return MusicFontSymbol.Flag16thUp;
                case Duration.ThirtySecond:
                    return MusicFontSymbol.Flag32ndUp;
                case Duration.SixtyFourth:
                    return MusicFontSymbol.Flag64thUp;
                case Duration.OneHundredTwentyEighth:
                    return MusicFontSymbol.Flag128thUp;
                case Duration.TwoHundredFiftySixth:
                    return MusicFontSymbol.Flag256thUp;
                default:
                    return MusicFontSymbol.Flag8thUp;
            }
        }
        switch (duration) {
            case Duration.Eighth:
                return MusicFontSymbol.Flag8thDown;
            case Duration.Sixteenth:
                return MusicFontSymbol.Flag16thDown;
            case Duration.ThirtySecond:
                return MusicFontSymbol.Flag32ndDown;
            case Duration.SixtyFourth:
                return MusicFontSymbol.Flag64thDown;
            case Duration.OneHundredTwentyEighth:
                return MusicFontSymbol.Flag128thDown;
            case Duration.TwoHundredFiftySixth:
                return MusicFontSymbol.Flag128thDown;
            default:
                return MusicFontSymbol.Flag8thDown;
        }
    }
}
