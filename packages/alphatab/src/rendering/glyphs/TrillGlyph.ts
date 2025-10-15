import type { ICanvas } from '@src/platform/ICanvas';
import { MusicFontSymbol } from '@src/model/MusicFontSymbol';
import { BeatXPosition } from '@src/rendering/BeatXPosition';
import { GroupedEffectGlyph } from '@src/rendering/glyphs/GroupedEffectGlyph';

/**
 * @internal
 */
export class TrillGlyph extends GroupedEffectGlyph {
    public constructor(x: number, y: number) {
        super(BeatXPosition.EndBeat);
        this.x = x;
        this.y = y;
    }

    public override doLayout(): void {
        super.doLayout();
        this.height = this.renderer.smuflMetrics.glyphHeights.get(MusicFontSymbol.OrnamentTrill)!;
    }

    protected override paintGrouped(cx: number, cy: number, endX: number, canvas: ICanvas): void {
        const trillSize = this.renderer.smuflMetrics.glyphWidths.get(MusicFontSymbol.OrnamentTrill)!;
        const startX: number = cx + this.x;

        const lineStart = startX + trillSize;

        const step: number = this.renderer.smuflMetrics.repeatOffsetX.get(MusicFontSymbol.WiggleTrill)!;
        const loops: number = Math.ceil((endX - lineStart) / step);

        const symbols: MusicFontSymbol[] = [MusicFontSymbol.OrnamentTrill];
        for (let i: number = 0; i < loops; i++) {
            symbols.push(MusicFontSymbol.WiggleTrill);
        }

        canvas.fillMusicFontSymbols(cx + this.x - trillSize / 2, cy + this.y + this.height, 1, symbols, false);
    }
}
