import { ICanvas, TextBaseline } from '@src/platform';
import { EffectGlyph } from './EffectGlyph';
import { Automation, Color, MusicFontSymbol } from '@src/model';
import { NoteHeadGlyph } from './NoteHeadGlyph';

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
            canvas.fillMusicFontSymbol(
                x,
                cy + this.y + this.height * 0.8,
                0.5,
                MusicFontSymbol.NoteQuarterUp,
                true
            );
            canvas.fillText(
                '= ' + automation.value.toString(),
                x + 8,
                cy + this.y + canvas.font.size / 2
            );
        }
    }
}
