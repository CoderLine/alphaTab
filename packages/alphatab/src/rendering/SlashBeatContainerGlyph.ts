import type { Note } from '@coderline/alphatab/model/Note';
import { BeatContainerGlyph } from '@coderline/alphatab/rendering/glyphs/BeatContainerGlyph';
import { SlashTieGlyph } from '@coderline/alphatab/rendering/glyphs/SlashTieGlyph';

/**
 * @internal
 */
export class SlashBeatContainerGlyph extends BeatContainerGlyph {
    private _tiedNoteTie: SlashTieGlyph | null = null;

    protected override createTies(n: Note): void {
        // create a tie if any effect requires it
        if (!n.isVisible) {
            return;
        }

        if (!this._tiedNoteTie && n.isTieOrigin && n.tieDestination!.isVisible) {
            const tie: SlashTieGlyph = new SlashTieGlyph('slash.tie', n, n.tieDestination!);
            this._tiedNoteTie = tie;
            this.addTie(tie);
        }
        // TODO multi system slurs
        // if (!this._tiedNoteTie && n.isTieDestination) {
        //     const tie: SlashTieGlyph = new SlashTieGlyph(n.tieOrigin!, n, true);
        //     this._tiedNoteTie = tie;
        //     this.addTie(tie);
        // }
    }
}
