import type { Note } from '@src/model/Note';
import { BeatContainerGlyph } from '@src/rendering/glyphs/BeatContainerGlyph';
import { SlashTieGlyph } from '@src/rendering/glyphs/SlashTieGlyph';

export class SlashBeatContainerGlyph extends BeatContainerGlyph {
    private _tiedNoteTie: SlashTieGlyph | null = null;

    protected override createTies(n: Note): void {
        // create a tie if any effect requires it
        if (!n.isVisible) {
            return;
        }

        if (!this._tiedNoteTie && n.isTieOrigin && n.tieDestination!.isVisible) {
            const tie: SlashTieGlyph = new SlashTieGlyph(n, n.tieDestination!, false);
            this._tiedNoteTie = tie;
            this.addTie(tie);
        }
        if (!this._tiedNoteTie && n.isTieDestination) {
            const tie: SlashTieGlyph = new SlashTieGlyph(n.tieOrigin!, n, true);
            this._tiedNoteTie = tie;
            this.addTie(tie);
        }
    }
}
