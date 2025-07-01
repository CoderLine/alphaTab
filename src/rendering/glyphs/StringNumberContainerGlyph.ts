import { EffectGlyph } from '@src/rendering/glyphs/EffectGlyph';
import { MusicFontSymbol } from '@src/model/MusicFontSymbol';
import type { ICanvas } from '@src/platform/ICanvas';

export class StringNumberContainerGlyph extends EffectGlyph {
    private _strings: Set<number> = new Set<number>();

    public addString(string: number) {
        this._strings.add(string);
    }

    public override doLayout(): void {
        const circleHeight =
            this.renderer.smuflMetrics.glyphWidths.get(MusicFontSymbol.GuitarString0)! * this.renderer.smuflMetrics.tuningGlyphCircleNumberScale;
        this.height = (circleHeight + this.renderer.smuflMetrics.stringNumberCirclePadding) * this._strings.size;
        this.width = circleHeight;
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        const tuningLength = this.renderer.bar.staff.tuning.length;

        let y = 0;
        const circleHeight =
            this.renderer.smuflMetrics.glyphWidths.get(MusicFontSymbol.GuitarString0)! * this.renderer.smuflMetrics.tuningGlyphCircleNumberScale;
        const noteHeadHeight = this.renderer.smuflMetrics.glyphHeights.get(MusicFontSymbol.NoteheadBlack)!;
        for (const s of this._strings) {
            const stringValue = tuningLength - s;
            const symbol = ((MusicFontSymbol.GuitarString1 as number) + stringValue) as MusicFontSymbol;
            canvas.fillMusicFontSymbol(
                cx + this.x + noteHeadHeight / 2,
                cy + this.y + circleHeight + y,
                this.renderer.smuflMetrics.tuningGlyphCircleNumberScale,
                symbol,
                true
            );
            y += circleHeight + this.renderer.smuflMetrics.stringNumberCirclePadding;
        }
    }
}
