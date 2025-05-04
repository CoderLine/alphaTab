import type { Automation } from '@src/model/Automation';
import { MusicFontSymbol } from '@src/model/MusicFontSymbol';
import { type ICanvas, TextBaseline } from '@src/platform/ICanvas';
import { EffectGlyph } from '@src/rendering/glyphs/EffectGlyph';
import { MusicFontSymbolSizes } from '@src/rendering/utils/MusicFontSymbolSizes';

/**
 * This glyph renders tempo annotations for tempo automations
 * where the drawing position is determined more dynamically while rendering.
 */
export class BarTempoGlyph extends EffectGlyph {
    private tempoAutomations: Automation[];

    public constructor(tempoAutomations: Automation[]) {
        super(0, 0);
        this.tempoAutomations = tempoAutomations;
    }

    public override doLayout(): void {
        super.doLayout();
        this.height = 25;
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        for (const automation of this.tempoAutomations) {
            let x = cx + this.renderer.getRatioPositionX(automation.ratioPosition);

            const res = this.renderer.resources;
            canvas.font = res.markerFont;

            canvas.textBaseline = TextBaseline.Top;
            if (automation.text) {
                const size = canvas.measureText(automation.text);
                canvas.fillText(automation.text, x, cy + this.y + canvas.font.size / 2);
                x += size.width + canvas.font.size * 0.7;
            }
            canvas.fillMusicFontSymbol(x, cy + this.y + this.height * 0.8, 0.5, MusicFontSymbol.NoteQuarterUp, true);
            canvas.fillText(
                `= ${automation.value.toString()}`,
                x + MusicFontSymbolSizes.Widths.get(MusicFontSymbol.NoteQuarterUp)! * 0.5 + 3,
                cy + this.y + canvas.font.size / 2
            );
        }
    }
}
