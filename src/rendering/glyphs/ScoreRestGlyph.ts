import { Duration } from '@src/model/Duration';
import { MusicFontGlyph } from '@src/rendering/glyphs/MusicFontGlyph';
import { MusicFontSymbol } from '@src/model/MusicFontSymbol';
import type { BeamingHelper } from '@src/rendering/utils/BeamingHelper';
import { ElementStyleHelper } from '@src/rendering/utils/ElementStyleHelper';
import type { ICanvas } from '@src/platform/ICanvas';
import { BeatSubElement } from '@src/model/Beat';

export class ScoreRestGlyph extends MusicFontGlyph {
    public beamingHelper!: BeamingHelper;

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
                return MusicFontSymbol.RestEighth;
            case Duration.Sixteenth:
                return MusicFontSymbol.RestSixteenth;
            case Duration.ThirtySecond:
                return MusicFontSymbol.RestThirtySecond;
            case Duration.SixtyFourth:
                return MusicFontSymbol.RestSixtyFourth;
            case Duration.OneHundredTwentyEighth:
                return MusicFontSymbol.RestOneHundredTwentyEighth;
            case Duration.TwoHundredFiftySixth:
                return MusicFontSymbol.RestTwoHundredFiftySixth;
            default:
                return MusicFontSymbol.None;
        }
    }

    public updateBeamingHelper(cx: number): void {
        if (this.beamingHelper) {
            this.beamingHelper.registerBeatLineX(
                'score',
                this.beat!,
                cx + this.x + this.width / 2,
                cx + this.x + this.width / 2
            );
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
