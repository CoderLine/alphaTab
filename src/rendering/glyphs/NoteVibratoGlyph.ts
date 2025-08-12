import { VibratoType } from '@src/model/VibratoType';
import type { ICanvas } from '@src/platform/ICanvas';
import { BeatXPosition } from '@src/rendering/BeatXPosition';
import { GroupedEffectGlyph } from '@src/rendering/glyphs/GroupedEffectGlyph';
import { MusicFontSymbol } from '@src/model/MusicFontSymbol';

export abstract class VibratoGlyphBase extends GroupedEffectGlyph {
    private _type: VibratoType;
    private _symbol: MusicFontSymbol = MusicFontSymbol.None;
    private _repeatOffsetX: number = 0;
    private _symbolOffsetY: number = 0;
    private _partialWaves: boolean;

    public constructor(x: number, y: number, type: VibratoType, partialWaves: boolean = false) {
        super(BeatXPosition.EndBeat);
        this._type = type;
        this.x = x;
        this.y = y;
        this._partialWaves = partialWaves;
    }

    protected abstract get slightVibratoGlyph(): MusicFontSymbol;
    protected abstract get wideVibratoGlyph(): MusicFontSymbol;

    public override doLayout(): void {
        super.doLayout();
        switch (this._type) {
            case VibratoType.Slight:
                this._symbol = this.slightVibratoGlyph;
                break;
            case VibratoType.Wide:
                this._symbol = this.wideVibratoGlyph;
                break;
        }

        this._repeatOffsetX = this.renderer.smuflMetrics.repeatOffsetX.get(this._symbol)!;
        this._symbolOffsetY = this.renderer.smuflMetrics.glyphTop.get(this._symbol)!;
        this.height = this.renderer.smuflMetrics.glyphHeights.get(this._symbol)!;
    }

    protected paintGrouped(cx: number, cy: number, endX: number, canvas: ICanvas): void {
        const startX: number = cx + this.x;
        const width: number = endX - startX;
        const repeatOffset: number = this._repeatOffsetX;

        let loops: number = width / repeatOffset;
        if (!this._partialWaves) {
            loops = Math.floor(loops);
        }
        if (loops < 1) {
            loops = 1;
        }

        const symbols: MusicFontSymbol[] = [];
        for (let i: number = 0; i < loops; i++) {
            symbols.push(this._symbol);
        }

        canvas.fillMusicFontSymbols(cx + this.x, cy + this.y + this._symbolOffsetY, 1, symbols, false);
    }
}

export class NoteVibratoGlyph extends VibratoGlyphBase {
    protected override get slightVibratoGlyph(): MusicFontSymbol {
        return MusicFontSymbol.GuitarVibratoStroke;
    }

    protected override get wideVibratoGlyph(): MusicFontSymbol {
        return MusicFontSymbol.GuitarWideVibratoStroke;
    }
}
