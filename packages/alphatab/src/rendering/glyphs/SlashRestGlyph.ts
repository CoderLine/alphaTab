import { BeatSubElement } from '@coderline/alphatab/model/Beat';
import type { ICanvas } from '@coderline/alphatab/platform/ICanvas';
import { ScoreRestGlyph } from '@coderline/alphatab/rendering/glyphs/ScoreRestGlyph';

/**
 * @internal
 */
export class SlashRestGlyph extends ScoreRestGlyph {
    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        super.internalPaint(cx, cy, canvas, BeatSubElement.SlashRests);
    }
}
