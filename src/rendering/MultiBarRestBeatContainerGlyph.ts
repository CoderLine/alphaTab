import { Beat } from '@src/model';
import { BeatContainerGlyph } from './glyphs/BeatContainerGlyph';
import { VoiceContainerGlyph } from './glyphs/VoiceContainerGlyph';
import { BeatGlyphBase } from './glyphs/BeatGlyphBase';
import { BeatOnNoteGlyphBase } from './glyphs/BeatOnNoteGlyphBase';
import { MultiBarRestGlyph } from './glyphs/MultiBarRestGlyph';


export class MultiBarRestBeatContainerGlyph extends BeatContainerGlyph {
    public constructor(voiceContainer: VoiceContainerGlyph) {
        super(MultiBarRestBeatContainerGlyph.getOrCreatePlaceholderBeat(voiceContainer), voiceContainer);
        this.preNotes = new BeatGlyphBase();
        this.onNotes = new BeatOnNoteGlyphBase();
    }

    public override doLayout(): void {
        if (this.renderer.showMultiBarRest) {
            this.onNotes.addGlyph(new MultiBarRestGlyph());
        }

        super.doLayout();
    }

    private static getOrCreatePlaceholderBeat(voiceContainer: VoiceContainerGlyph): Beat {
        if (voiceContainer.voice.beats.length > 1) {
            return voiceContainer.voice.beats[0];
        } else {
            const placeholder = new Beat();
            placeholder.voice = voiceContainer.voice;
            return placeholder;
        }
    }
}
