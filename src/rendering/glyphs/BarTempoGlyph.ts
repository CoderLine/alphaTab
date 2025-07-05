import type { Automation } from '@src/model/Automation';
import { MusicFontSymbol } from '@src/model/MusicFontSymbol';
import { TextBaseline, type ICanvas } from '@src/platform/ICanvas';
import { EffectGlyph } from '@src/rendering/glyphs/EffectGlyph';

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
        super.doLayout;
        const res = this.renderer.resources;
        this.height =
            this.renderer.smuflMetrics.glyphHeights.get(MusicFontSymbol.MetNoteQuarterUp)! *
            res.smuflMetrics.tempoNoteScale;
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        for (const automation of this.tempoAutomations) {
            let x = cx + this.renderer.getRatioPositionX(automation.ratioPosition);

            const res = this.renderer.resources;
            canvas.font = res.markerFont;

            const notePosY =
                cy +
                this.y +
                this.height +
                this.renderer.smuflMetrics.glyphBottom.get(MusicFontSymbol.MetNoteQuarterUp)! *
                    res.smuflMetrics.tempoNoteScale;

            const b = canvas.textBaseline;
            canvas.textBaseline = TextBaseline.Alphabetic;
            if (automation.text) {
                const text = `${automation.text} `; // additional space
                const size = canvas.measureText(text);
                canvas.fillText(text, x, notePosY);
                x += size.width;
            }

            canvas.fillMusicFontSymbol(x, notePosY, res.smuflMetrics.tempoNoteScale, MusicFontSymbol.MetNoteQuarterUp);
            x +=
                this.renderer.smuflMetrics.glyphWidths.get(MusicFontSymbol.MetNoteQuarterUp)! *
                res.smuflMetrics.tempoNoteScale;

            canvas.fillText(` = ${automation.value.toString()}`, x, notePosY);
            canvas.textBaseline = b;

            x += canvas.measureText(` = ${automation.value.toString()}`).width;
        }
    }
}
