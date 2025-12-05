import { MusicFontSymbol } from '@coderline/alphatab/model/MusicFontSymbol';
import type { ICanvas } from '@coderline/alphatab/platform/ICanvas';
import type { LineBarRenderer } from '@coderline/alphatab/rendering/LineBarRenderer';
import { Glyph } from '@coderline/alphatab/rendering/glyphs/Glyph';
import { NumberGlyph } from '@coderline/alphatab/rendering/glyphs/NumberGlyph';

/**
 * @internal
 */
export class MultiBarRestGlyph extends Glyph {
    private static readonly _restSymbols = [
        MusicFontSymbol.RestHBarLeft,
        MusicFontSymbol.RestHBarMiddle,
        MusicFontSymbol.RestHBarMiddle,
        MusicFontSymbol.RestHBarMiddle,
        MusicFontSymbol.RestHBarRight
    ];

    private _numberGlyph: MusicFontSymbol[] = [];
    private _numberTop = 0;
    constructor() {
        super(0, 0);
    }

    public override doLayout(): void {
        const smufl = this.renderer.smuflMetrics;
        this.width = MultiBarRestGlyph._restSymbols.reduce((p, c) => p + smufl.glyphWidths.get(c)!, 0);

        const i: number = this.renderer.additionalMultiRestBars!.length + 1;
        this._numberGlyph = NumberGlyph.getSymbols(i);

        this._numberTop = (this.renderer as LineBarRenderer).getLineY(-1.5);

        const numberGlyphTop = smufl.glyphTop.get(this._numberGlyph[0])!;
        this.renderer.registerOverflowTop(Math.abs(this._numberTop) + numberGlyphTop);

    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        canvas.fillMusicFontSymbols(
            cx + this.x,
            cy + this.y + this.renderer.height / 2,
            1,
            MultiBarRestGlyph._restSymbols
        );

        const numberTop = (this.renderer as LineBarRenderer).getLineY(-1.5);

        canvas.fillMusicFontSymbols(
            cx + this.x + this.width / 2,
            (cy + this.y + numberTop) | 0,
            1,
            this._numberGlyph,
            true
        );
    }
}
