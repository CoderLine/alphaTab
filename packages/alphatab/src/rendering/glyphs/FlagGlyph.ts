import { EngravingSettings } from '@coderline/alphatab/EngravingSettings';
import { Duration } from '@coderline/alphatab/model/Duration';
import { MusicFontSymbol } from '@coderline/alphatab/model/MusicFontSymbol';
import type { ICanvas } from '@coderline/alphatab/platform/ICanvas';
import { MusicFontGlyph } from '@coderline/alphatab/rendering/glyphs/MusicFontGlyph';
import { BeamDirection } from '@coderline/alphatab/rendering/utils/BeamDirection';

/**
 * @internal
 */
export class FlagGlyph extends MusicFontGlyph {
    public constructor(x: number, y: number, duration: Duration, direction: BeamDirection, isGrace: boolean) {
        super(x, y, isGrace ? EngravingSettings.GraceScale : 1, FlagGlyph.getSymbol(duration, direction, isGrace));
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        const c = canvas.color;
        super.paint(cx, cy, canvas);
        canvas.color = c;
    }

    public static getSymbol(duration: Duration, direction: BeamDirection, isGrace: boolean): MusicFontSymbol {
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
