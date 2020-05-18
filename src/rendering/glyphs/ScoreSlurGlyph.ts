import { Note } from '@src/model/Note';
import { ScoreLegatoGlyph } from './ScoreLegatoGlyph';

export class ScoreSlurGlyph extends ScoreLegatoGlyph {
    public constructor(startNote: Note, endNote: Note, forEnd: boolean = false) {
        super(startNote.beat, endNote.beat, forEnd);
    }

    protected getTieHeight(startX: number, startY: number, endX: number, endY: number): number {
        return Math.log2(endX - startX + 1) * this.renderer.settings.notation.slurHeight;
    }
}
