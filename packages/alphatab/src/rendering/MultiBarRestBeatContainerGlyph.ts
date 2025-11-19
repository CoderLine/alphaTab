import { Beat } from '@coderline/alphatab/model/Beat';
import { BeatContainerGlyph } from '@coderline/alphatab/rendering/glyphs/BeatContainerGlyph';
import type { VoiceContainerGlyph } from '@coderline/alphatab/rendering/glyphs/VoiceContainerGlyph';
import { BeatGlyphBase } from '@coderline/alphatab/rendering/glyphs/BeatGlyphBase';
import { BeatOnNoteGlyphBase } from '@coderline/alphatab/rendering/glyphs/BeatOnNoteGlyphBase';
import { MultiBarRestGlyph } from '@coderline/alphatab/rendering/glyphs/MultiBarRestGlyph';

/**
 * @internal
 */
export class MultiBarRestBeatContainerGlyph extends BeatContainerGlyph {
    public constructor(voiceContainer: VoiceContainerGlyph) {
        super(MultiBarRestBeatContainerGlyph._getOrCreatePlaceholderBeat(voiceContainer), voiceContainer);
        this.preNotes = new BeatGlyphBase();
        this.onNotes = new BeatOnNoteGlyphBase();
    }

    public override doLayout(): void {
        if (this.renderer.showMultiBarRest) {
            this.onNotes.addNormal(new MultiBarRestGlyph());
        }

        super.doLayout();
    }

    private static _getOrCreatePlaceholderBeat(voiceContainer: VoiceContainerGlyph): Beat {
        if (voiceContainer.voice.beats.length > 1) {
            return voiceContainer.voice.beats[0];
        }
        const placeholder = new Beat();
        placeholder.voice = voiceContainer.voice;
        return placeholder;
    }
}
