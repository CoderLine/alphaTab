import type { ICanvas } from '@src/platform/ICanvas';
import { MusicFontSymbol } from '@src/model/MusicFontSymbol';
import { BeatXPosition } from '@src/rendering/BeatXPosition';
import { GroupedEffectGlyph } from '@src/rendering/glyphs/GroupedEffectGlyph';
import { MusicFontSymbolSizes } from '@src/rendering/utils/MusicFontSymbolSizes';

export class TrillGlyph extends GroupedEffectGlyph {
    public constructor(x: number, y: number) {
        super(BeatXPosition.EndBeat);
        this.x = x;
        this.y = y;
    }

    public override doLayout(): void {
        super.doLayout();
        this.height = MusicFontSymbolSizes.Heights.get(MusicFontSymbol.OrnamentTrill)! / 2;
    }

    protected override paintGrouped(cx: number, cy: number, endX: number, canvas: ICanvas): void {
        let startX: number = cx + this.x;

        canvas.fillMusicFontSymbol(startX, cy + this.y + this.height, 1, MusicFontSymbol.OrnamentTrill, true);

        startX += MusicFontSymbolSizes.Widths.get(MusicFontSymbol.OrnamentTrill)! / 2;

        const waveScale: number = 1.2;
        const step: number = MusicFontSymbolSizes.Widths.get(MusicFontSymbol.WiggleTrill)! * waveScale;
        const loops: number = Math.floor((endX - startX) / step);
        const loopY: number = cy + this.y + this.height * 1.37;
        let loopX: number = startX;
        for (let i: number = 0; i < loops; i++) {
            canvas.fillMusicFontSymbol(loopX, loopY, waveScale, MusicFontSymbol.WiggleTrill, false);
            loopX += step;
        }
    }
}
