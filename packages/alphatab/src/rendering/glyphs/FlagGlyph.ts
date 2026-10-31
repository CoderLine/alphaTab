import { EngravingSettings } from '@coderline/alphatab/EngravingSettings';
import { Duration } from '@coderline/alphatab/model/Duration';
import { MusicFontSymbol } from '@coderline/alphatab/model/MusicFontSymbol';
import type { ICanvas } from '@coderline/alphatab/platform/ICanvas';
import { BeamDirection } from '@coderline/alphatab/rendering/utils/BeamDirection';

/**
 * @internal
 */
export class FlagGlyph {
    /**
     * Paints the flag symbol of a beat with the given properties.
     * @returns The width of the flag.
     */
    public static paintFlag(
        canvas: ICanvas,
        metrics: EngravingSettings,
        x: number,
        y: number,
        duration: Duration,
        direction: BeamDirection,
        isGrace: boolean
    ): number {
        const symbol = FlagGlyph.getSymbol(duration, direction, isGrace);
        const scale = isGrace ? EngravingSettings.GraceScale : 1;
        const width = metrics.glyphWidths.get(symbol)! * scale;
        const height = metrics.glyphHeights.get(symbol)! * scale;
        if (width !== 0 || height !== 0) {
            canvas.fillMusicFontSymbol(x, y, scale, symbol, false);
        }
        return width;
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
