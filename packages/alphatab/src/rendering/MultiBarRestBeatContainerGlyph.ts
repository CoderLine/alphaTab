import { Beat } from '@src/model/Beat';
import { BeatContainerGlyph } from '@src/rendering/glyphs/BeatContainerGlyph';
import type { VoiceContainerGlyph } from '@src/rendering/glyphs/VoiceContainerGlyph';
import { BeatGlyphBase } from '@src/rendering/glyphs/BeatGlyphBase';
import { BeatOnNoteGlyphBase } from '@src/rendering/glyphs/BeatOnNoteGlyphBase';
import { MultiBarRestGlyph } from '@src/rendering/glyphs/MultiBarRestGlyph';

export class MultiBarRestBeatContainerGlyph extends BeatContainerGlyph {
    public constructor(voiceContainer: VoiceContainerGlyph) {
        super(MultiBarRestBeatContainerGlyph.getOrCreatePlaceholderBeat(voiceContainer), voiceContainer);
        this.preNotes = new BeatGlyphBase();
        this.onNotes = new BeatOnNoteGlyphBase();
    }

    public override doLayout(): void {
        if (this.renderer.showMultiBarRest) {
            this.onNotes.addNormal(new MultiBarRestGlyph());
        }

        super.doLayout();
    }

    private static getOrCreatePlaceholderBeat(voiceContainer: VoiceContainerGlyph): Beat {
        if (voiceContainer.voice.beats.length > 1) {
            return voiceContainer.voice.beats[0];
        }
        const placeholder = new Beat();
        placeholder.voice = voiceContainer.voice;
        return placeholder;
    }
}
