import { Beat } from '@src/model/Beat';
import { Note } from '@src/model/Note';
import { BeatContainerGlyph } from '@src/rendering/glyphs/BeatContainerGlyph';
import { VoiceContainerGlyph } from '@src/rendering/glyphs/VoiceContainerGlyph';

export class NumberedBeatContainerGlyph extends BeatContainerGlyph {
    public constructor(beat: Beat, voiceContainer: VoiceContainerGlyph) {
        super(beat, voiceContainer);
    }

    protected override createTies(n: Note): void {
        // create a tie if any effect requires it
        if (!n.isVisible) {
            return;
        }

        // TODO(Numbered): Add Ties
    }
}
