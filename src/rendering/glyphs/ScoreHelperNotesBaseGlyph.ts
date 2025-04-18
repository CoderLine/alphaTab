import type { Beat } from '@src/model/Beat';
import type { ICanvas } from '@src/platform/ICanvas';
import type { BendNoteHeadGroupGlyph } from '@src/rendering/glyphs/BendNoteHeadGroupGlyph';
import { Glyph } from '@src/rendering/glyphs/Glyph';
import type { ScoreBarRenderer } from '@src/rendering/ScoreBarRenderer';
import { BeamDirection } from '@src/rendering/utils/BeamDirection';
import { TieGlyph } from '@src/rendering/glyphs/TieGlyph';

export class ScoreHelperNotesBaseGlyph extends Glyph {
    public static readonly EndPadding: number = ((10 / 2) | 0) + 3;
    protected BendNoteHeads: BendNoteHeadGroupGlyph[] = [];

    protected drawBendSlur(
        canvas: ICanvas,
        x1: number,
        y1: number,
        x2: number,
        y2: number,
        down: boolean,
        scale: number,
        slurText?: string
    ): void {
        TieGlyph.drawBendSlur(canvas, x1, y1, x2, y2, down, scale, slurText);
    }

    public override doLayout(): void {
        super.doLayout();
        this.width = 0;
        for (const noteHeads of this.BendNoteHeads) {
            noteHeads.doLayout();
            this.width += noteHeads.width + 10;
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
