import { BeatSubElement } from '@coderline/alphatab/model/Beat';
import { Duration } from '@coderline/alphatab/model/Duration';
import { MusicFontSymbol } from '@coderline/alphatab/model/MusicFontSymbol';
import type { ICanvas } from '@coderline/alphatab/platform/ICanvas';
import { MusicFontGlyph } from '@coderline/alphatab/rendering/glyphs/MusicFontGlyph';
import { ElementStyleHelper } from '@coderline/alphatab/rendering/utils/ElementStyleHelper';

/**
 * @internal
 */
export class ScoreRestGlyph extends MusicFontGlyph {
    public constructor(x: number, y: number, duration: Duration) {
        super(x, y, 1, ScoreRestGlyph.getSymbol(duration));
    }

    public static getSymbol(duration: Duration): MusicFontSymbol {
        switch (duration) {
            case Duration.QuadrupleWhole:
                return MusicFontSymbol.RestLonga;
            case Duration.DoubleWhole:
                return MusicFontSymbol.RestDoubleWhole;
            case Duration.Whole:
                return MusicFontSymbol.RestWhole;
            case Duration.Half:
                return MusicFontSymbol.RestHalf;
            case Duration.Quarter:
                return MusicFontSymbol.RestQuarter;
            case Duration.Eighth:
                return MusicFontSymbol.Rest8th;
            case Duration.Sixteenth:
                return MusicFontSymbol.Rest16th;
            case Duration.ThirtySecond:
                return MusicFontSymbol.Rest32nd;
            case Duration.SixtyFourth:
                return MusicFontSymbol.Rest64th;
            case Duration.OneHundredTwentyEighth:
                return MusicFontSymbol.Rest128th;
            case Duration.TwoHundredFiftySixth:
                return MusicFontSymbol.Rest256th;
            default:
                return MusicFontSymbol.None;
        }
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        this.internalPaint(cx, cy, canvas, BeatSubElement.StandardNotationRests);
    }

    protected internalPaint(cx: number, cy: number, canvas: ICanvas, element: BeatSubElement): void {
        using _ = ElementStyleHelper.beat(canvas, element, this.beat!);
        super.paint(cx, cy, canvas);
    }
}
