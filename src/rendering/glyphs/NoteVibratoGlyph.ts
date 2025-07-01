import { VibratoType } from '@src/model/VibratoType';
import type { ICanvas } from '@src/platform/ICanvas';
import { BeatXPosition } from '@src/rendering/BeatXPosition';
import { GroupedEffectGlyph } from '@src/rendering/glyphs/GroupedEffectGlyph';
import { MusicFontSymbol } from '@src/model/MusicFontSymbol';

export class NoteVibratoGlyph extends GroupedEffectGlyph {
    private _type: VibratoType;
    private _symbol: MusicFontSymbol = MusicFontSymbol.None;
    private _symbolSize: number = 0;
    private _symbolOffsetY: number = 0;
    private _partialWaves: boolean;

    public constructor(x: number, y: number, type: VibratoType, partialWaves: boolean = false) {
        super(BeatXPosition.EndBeat);
        this._type = type;
        this.x = x;
        this.y = y;
        this._partialWaves = partialWaves;
    }

    public override doLayout(): void {
        super.doLayout();
        switch (this._type) {
            case VibratoType.Slight:
                this._symbol = MusicFontSymbol.WiggleTrill;
                break;
            case VibratoType.Wide:
                this._symbol = MusicFontSymbol.WiggleVibratoMediumFast;
                break;
        }

        this._symbolSize = this.renderer.smuflMetrics.glyphWidths.get(this._symbol)!;
        this._symbolOffsetY = this.renderer.smuflMetrics.glyphTop.get(this._symbol)!;
        this.height = this.renderer.smuflMetrics.glyphHeights.get(this._symbol)!;
    }

    protected paintGrouped(cx: number, cy: number, endX: number, canvas: ICanvas): void {
        const startX: number = cx + this.x;
        const width: number = endX - startX;
        const step: number = this._symbolSize;

        // TODO: respect overlap for calculation?
        let loops: number = width / step;
        if (!this._partialWaves) {
            loops = Math.floor(loops);
        }
        if (loops < 1) {
            loops = 1;
        }

        const symbols:MusicFontSymbol[]=[];
        for (let i: number = 0; i < loops; i++) {
            symbols.push(this._symbol);
        }

        canvas.fillMusicFontSymbols(
            cx + this.x,
            cy + this.y + this._symbolOffsetY,
            1,
            symbols,
            false
        );
    }
}
