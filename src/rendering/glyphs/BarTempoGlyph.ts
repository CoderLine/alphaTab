import { ICanvas, TextBaseline } from '@src/platform';
import { EffectGlyph } from './EffectGlyph';
import { Automation, MusicFontSymbol } from '@src/model';
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
        this.height = 25 * this.scale;
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        const startX = cx + this.x;
        const endX = cx + this.renderer.postBeatGlyphsStart;

        for(const automation of this.tempoAutomations) {
            const x = cx + this.x + (endX - startX) * automation.ratioPosition;
            const res = this.renderer.resources;
            canvas.font = res.markerFont;
            canvas.fillMusicFontSymbol(
                x,
                cy + this.y + this.height * 0.8,
                this.scale * NoteHeadGlyph.GraceScale,
                MusicFontSymbol.NoteQuarterUp,
                false
            );
            canvas.textBaseline = TextBaseline.Top;
            canvas.fillText(
                '= ' + automation.value.toString(),
                x + this.height / 2,
                cy + this.y + canvas.font.size / 2
            );
        }
    }
}