import { TimeSignatureGlyph } from '@src/rendering/glyphs/TimeSignatureGlyph';
import { ScoreBarRenderer } from '@src/rendering/ScoreBarRenderer';

export class ScoreTimeSignatureGlyph extends TimeSignatureGlyph {
    protected get commonY(): number {
        let renderer: ScoreBarRenderer = this.renderer as ScoreBarRenderer;
        return renderer.getScoreY(4, 0);
    }

    protected get numeratorY(): number {
        return 2 * this.scale;
    }

    protected get denominatorY(): number {
        return 20 * this.scale;
    }

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
