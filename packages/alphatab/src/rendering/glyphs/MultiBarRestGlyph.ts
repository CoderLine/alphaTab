import { MusicFontSymbol } from '@coderline/alphatab/model/MusicFontSymbol';
import type { ICanvas } from '@coderline/alphatab/platform/ICanvas';
import { Glyph } from '@coderline/alphatab/rendering/glyphs/Glyph';
import { NumberGlyph } from '@coderline/alphatab/rendering/glyphs/NumberGlyph';
import type { LineBarRenderer } from '@coderline/alphatab/rendering/LineBarRenderer';

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
    private _numberInkTop = 0;
    private _numberWidth = 0;
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
        this._numberWidth = this._numberGlyph.reduce((p, c) => p + smufl.glyphWidths.get(c)!, 0);
        this._numberInkTop = this._numberTop - numberGlyphTop;
        this.renderer.registerOverflowTop(Math.abs(this._numberTop) + numberGlyphTop);
    }

    /**
     * Emits the bar count above the staff into the renderer's bar-local skyline.
     * @param base The renderer-local x of the parent of this glyph.
     */
    public emitSkyline(base: number): void {
        const top = this.y + this._numberInkTop;
        const center = base + this.x + this.width / 2;
        this.renderer.insertSkylineTop(center - this._numberWidth / 2, center + this._numberWidth / 2, -top);
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
