import { TimeSignatureGlyph } from '@src/rendering/glyphs/TimeSignatureGlyph';

export class ScoreTimeSignatureGlyph extends TimeSignatureGlyph {
    protected get commonScale(): number {
        return 1;
    }

    protected get numberScale(): number {
        return 1;
    }

    public constructor(x: number, y: number, numerator: number, denominator: number, isCommon: boolean) {
        super(x, y, numerator, denominator, isCommon);
    }
}
