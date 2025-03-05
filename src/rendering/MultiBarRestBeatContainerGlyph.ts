import { Beat, MusicFontSymbol } from '@src/model';
import { BeatContainerGlyph } from './glyphs/BeatContainerGlyph';
import { VoiceContainerGlyph } from './glyphs/VoiceContainerGlyph';
import { BeatGlyphBase } from './glyphs/BeatGlyphBase';
import { BeatOnNoteGlyphBase } from './glyphs/BeatOnNoteGlyphBase';
import { ICanvas } from '@src/platform';
import { Glyph } from './glyphs/Glyph';
import { DigitGlyph } from './glyphs/DigitGlyph';
import { LineBarRenderer } from './LineBarRenderer';

class MultiBarRestGlyph extends Glyph {
    private _numberGlyph: MusicFontSymbol[] = [];
    private static readonly BarWidth = 60;
    constructor() {
        super(0, 0);
    }

    public override doLayout(): void {
        this.width = 70;

        this.renderer.registerOverflowTop((this.renderer as LineBarRenderer).getLineHeight(1));

        let i: number = this.renderer.additionalMultiRestBars!.length + 1;
        while (i > 0) {
            let num: number = i % 10;
            this._numberGlyph.unshift(DigitGlyph.getSymbol(num));
            i = (i / 10) | 0;
        }
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        canvas.fillMusicFontSymbols(cx + this.x, cy + this.y + this.renderer.height / 2, 1, [
            MusicFontSymbol.RestHBarLeft,
            MusicFontSymbol.RestHBarMiddle,
            MusicFontSymbol.RestHBarMiddle,
            MusicFontSymbol.RestHBarMiddle,
            MusicFontSymbol.RestHBarRight
        ]);

        const numberTop = (this.renderer as LineBarRenderer).getLineY(-1.5);

        canvas.fillMusicFontSymbols(
            cx + this.x + MultiBarRestGlyph.BarWidth / 2,
            cy + this.y + numberTop,
            1,
            this._numberGlyph,
            true
        );
    }
}

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
