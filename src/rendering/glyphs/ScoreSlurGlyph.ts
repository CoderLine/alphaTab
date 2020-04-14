import { Note } from '@src/model/Note';
import { ScoreTieGlyph } from '@src/rendering/glyphs/ScoreTieGlyph';

export class ScoreSlurGlyph extends ScoreTieGlyph {
    public constructor(startNote: Note, endNote: Note, forEnd: boolean = false) {
        super(startNote, endNote, forEnd);
    }

    protected getTieHeight(startX: number, startY: number, endX: number, endY: number): number {
        return Math.log(endX - startX + 1) * this.renderer.settings.notation.slurHeight;
    }
}
