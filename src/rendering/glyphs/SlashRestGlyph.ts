import { BeatSubElement } from '@src/model/Beat';
import type { ICanvas } from '@src/platform/ICanvas';
import { ScoreRestGlyph } from '@src/rendering/glyphs/ScoreRestGlyph';

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
