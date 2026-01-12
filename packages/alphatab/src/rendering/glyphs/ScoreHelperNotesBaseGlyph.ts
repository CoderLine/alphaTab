import type { Beat } from '@coderline/alphatab/model/Beat';
import type { ICanvas } from '@coderline/alphatab/platform/ICanvas';
import { GlyphGroup } from '@coderline/alphatab/rendering/glyphs/GlyphGroup';
import { TieGlyph } from '@coderline/alphatab/rendering/glyphs/TieGlyph';
import type { ScoreBarRenderer } from '@coderline/alphatab/rendering/ScoreBarRenderer';
import { BeamDirection } from '@coderline/alphatab/rendering/utils/BeamDirection';

/**
 * @internal
 */
export class ScoreHelperNotesBaseGlyph extends GlyphGroup {
    protected drawBendSlur(
        canvas: ICanvas,
        x1: number,
        y1: number,
        x2: number,
        y2: number,
        down: boolean,
        slurText?: string
    ): void {
        TieGlyph.drawBendSlur(canvas, x1, y1, x2, y2, down, this.renderer.smuflMetrics.tieHeight, slurText);
    }

    public override doLayout(): void {
        if (!this.glyphs) {
            return;
        }

        this.width = 0;
        for (const noteHeads of this.glyphs) {
            noteHeads.doLayout();
            this.width += noteHeads.width;
        }
    }

    protected getTieDirection(beat: Beat, noteRenderer: ScoreBarRenderer): BeamDirection {
        // invert direction (if stems go up, ties go down to not cross them)
        switch (noteRenderer.getBeatDirection(beat)) {
            case BeamDirection.Up:
                return BeamDirection.Down;
            default:
                return BeamDirection.Up;
        }
    }
}
