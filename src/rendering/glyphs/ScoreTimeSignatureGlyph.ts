import { TimeSignatureGlyph } from '@src/rendering/glyphs/TimeSignatureGlyph';

export class ScoreTimeSignatureGlyph extends TimeSignatureGlyph {
    protected get commonScale(): number {
        return this.renderer.smuflMetrics.scoreTimeSignatureCommonScale;
    }

    protected get numberScale(): number {
        return  this.renderer.smuflMetrics.scoreTimeSignatureNumberScale;
    }
}
