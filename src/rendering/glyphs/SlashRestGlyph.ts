import { Duration } from '@src/model/Duration';
import { ScoreRestGlyph } from './ScoreRestGlyph';
import { ICanvas } from '@src/platform';
import { BeatSubElement } from '@src/model';

export class SlashRestGlyph extends ScoreRestGlyph {
    public constructor(x: number, y: number, duration: Duration) {
        super(x, y, duration);
    }

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
