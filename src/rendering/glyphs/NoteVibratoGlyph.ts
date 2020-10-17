import { VibratoType } from '@src/model/VibratoType';
import { ICanvas } from '@src/platform/ICanvas';
import { BeatXPosition } from '@src/rendering/BeatXPosition';
import { GroupedEffectGlyph } from '@src/rendering/glyphs/GroupedEffectGlyph';
import { MusicFontSymbol } from '@src/model/MusicFontSymbol';

export class NoteVibratoGlyph extends GroupedEffectGlyph {
    private _type: VibratoType;
    private _scale: number = 0;
    private _symbol: MusicFontSymbol = MusicFontSymbol.None;
    private _symbolSize: number = 0;
    private _partialWaves: boolean;

    public constructor(x: number, y: number, type: VibratoType, scale: number = 1.2, partialWaves: boolean = false) {
        super(BeatXPosition.EndBeat);
        this._type = type;
        this._scale = scale;
        this.x = x;
        this.y = y;
        this._partialWaves = partialWaves;
    }

    public doLayout(): void {
        super.doLayout();
        let symbolHeight: number = 0;
        switch (this._type) {
            case VibratoType.Slight:
                this._symbol = MusicFontSymbol.WiggleTrill;
                this._symbolSize = 9 * this._scale;
                symbolHeight = 6 * this._scale;
                break;
            case VibratoType.Wide:
                this._symbol = MusicFontSymbol.WiggleVibratoMediumFast;
                this._symbolSize = 10 * this._scale;
                symbolHeight = 10 * this._scale;
                break;
        }
        this.height = symbolHeight * this.scale;
    }

    protected paintGrouped(cx: number, cy: number, endX: number, canvas: ICanvas): void {
        let startX: number = cx + this.x;
        let width: number = endX - startX;
        let step: number = this._symbolSize * this.scale;

        let loops: number = width / step;
        if (!this._partialWaves) {
            loops = Math.floor(loops);
        }
        if (loops < 1) {
            loops = 1;
        }

        let loopX: number = 0;

        for (let i: number = 0; i < loops; i++) {
            canvas.fillMusicFontSymbol(
                cx + this.x + loopX,
                cy + this.y + this.height * 2,
                this._scale * this.scale,
                this._symbol,
                false
            );
            loopX += step;
        }
    }
}
