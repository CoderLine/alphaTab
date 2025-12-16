import { type Beat, BeatSubElement } from '@coderline/alphatab/model/Beat';
import { MusicFontSymbol } from '@coderline/alphatab/model/MusicFontSymbol';
import { NoteSubElement } from '@coderline/alphatab/model/Note';
import { CanvasHelper, type ICanvas, TextAlign, TextBaseline } from '@coderline/alphatab/platform/ICanvas';
import { Glyph } from '@coderline/alphatab/rendering/glyphs/Glyph';
import { ElementStyleHelper } from '@coderline/alphatab/rendering/utils/ElementStyleHelper';

/**
 * @internal
 */
export class NumberedNoteHeadGlyph extends Glyph {
    private _isGrace: boolean;
    private _beat: Beat;
    private _number: string;
    private _octaveDots: number;
    private _octaveDotsY: number = 0;
    private _octaveDotHeight: number = 0;

    public constructor(x: number, y: number, number: string, isGrace: boolean, beat: Beat, octaveDots: number) {
        super(x, y);
        this._isGrace = isGrace;
        this._number = number;
        this._beat = beat;
        this._octaveDots = octaveDots;
    }

    public override getBoundingBoxTop(): number {
        let y = -this.height / 2;

        if (this._octaveDots > 0 && this._octaveDotsY < y) {
            y = this._octaveDotsY;
        }
        return this.y + y;
    }

    public override getBoundingBoxBottom(): number {
        let y = this.height / 2;

        const dotsBottom = this._octaveDotsY + Math.abs(this._octaveDots) * this._octaveDotHeight * 2;
        if (this._octaveDots < 0 && y < dotsBottom) {
            y = dotsBottom;
        }

        return this.y + y;
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        using _ = this._beat.isRest
            ? ElementStyleHelper.beat(canvas, BeatSubElement.NumberedRests, this._beat)
            : this._beat.notes.length > 0
              ? ElementStyleHelper.note(canvas, NoteSubElement.NumberedNumber, this._beat.notes[0])
              : undefined;

        const res = this.renderer.resources;
        canvas.font = this._isGrace ? res.numberedNotationGraceFont : res.numberedNotationFont;
        const baseline = canvas.textBaseline;
        canvas.textBaseline = TextBaseline.Middle;
        canvas.textAlign = TextAlign.Left;
        canvas.fillText(this._number.toString(), cx + this.x, cy + this.y);
        canvas.textBaseline = baseline;

        const dotCount = Math.abs(this._octaveDots);
        let dotsY = this._octaveDotsY + res.engravingSettings.glyphTop.get(MusicFontSymbol.AugmentationDot)!;
        for (let d = 0; d < dotCount; d++) {
            CanvasHelper.fillMusicFontSymbolSafe(
                canvas,
                cx + this.x + this.width / 2,
                cy + this.y + dotsY,
                1,
                MusicFontSymbol.AugmentationDot,
                true
            );
            dotsY += this._octaveDotHeight * 2;
        }
    }

    public override doLayout(): void {
        const res = this.renderer.resources;
        const font = this._isGrace ? res.numberedNotationGraceFont : res.numberedNotationFont;
        const c = this.renderer.scoreRenderer.canvas!;
        c.font = font;
        const size = c.measureText(`${this._number}`);
        this.height = size.height;
        this.width = size.width;

        const dotCount = this._octaveDots;

        const dotHeight = res.engravingSettings.glyphHeights.get(MusicFontSymbol.AugmentationDot)!;
        const allDotsHeight = Math.abs(dotCount) * dotHeight * 2;
        if (dotCount > 0) {
            this._octaveDotsY =
                -(this.height / 2) -
                allDotsHeight -
                res.engravingSettings.glyphTop.get(MusicFontSymbol.AugmentationDot)!;
        } else if (dotCount < 0) {
            this._octaveDotsY =
                this.height / 2 +
                // one for the padding
                dotHeight +
                // align the dots
                res.engravingSettings.glyphTop.get(MusicFontSymbol.AugmentationDot)!;
        }
        this._octaveDotHeight = dotHeight;
    }
}
