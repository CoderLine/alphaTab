import { BeatSubElement } from '@coderline/alphatab/model/Beat';
import type { ICanvas } from '@coderline/alphatab/platform/ICanvas';
import { ScoreRestGlyph } from '@coderline/alphatab/rendering/glyphs/ScoreRestGlyph';

/**
 * @internal
 */
export class SlashRestGlyph extends ScoreRestGlyph {
    public override updateBeamingHelper(cx: number): void {
        if (this.beamingHelper) {
            this.beamingHelper.registerBeatLineX(
                'slash',
                this.beat!,
                cx + this.x + this.width / 2,
                cx + this.x + this.width / 2
            );
        }
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        super.internalPaint(cx, cy, canvas, BeatSubElement.SlashRests);
    }
}
