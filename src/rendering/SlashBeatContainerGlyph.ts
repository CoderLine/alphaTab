import { Beat } from '@src/model/Beat';
import { Note } from '@src/model/Note';
import { BeatContainerGlyph } from '@src/rendering/glyphs/BeatContainerGlyph';
import { VoiceContainerGlyph } from '@src/rendering/glyphs/VoiceContainerGlyph';
import { SlashTieGlyph } from './glyphs/SlashTieGlyph';

export class SlashBeatContainerGlyph extends BeatContainerGlyph {
    private _tiedNoteTie: SlashTieGlyph | null = null;

    public constructor(beat: Beat, voiceContainer: VoiceContainerGlyph) {
        super(beat, voiceContainer);
    }

    protected override createTies(n: Note): void {
        // create a tie if any effect requires it
        if (!n.isVisible) {
            return;
        }

        if (!this._tiedNoteTie && n.isTieOrigin && n.tieDestination!.isVisible) {
            let tie: SlashTieGlyph = new SlashTieGlyph(n, n.tieDestination!, false);
            this._tiedNoteTie= tie;
            this.addTie(tie);
        }
        if (!this._tiedNoteTie && n.isTieDestination) {
            let tie: SlashTieGlyph = new SlashTieGlyph(n.tieOrigin!, n, true);
            this._tiedNoteTie= tie;
            this.addTie(tie);
        }
    }
}
