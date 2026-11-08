import type { Font } from '@coderline/alphatab/model/Font';
import { ModelUtils } from '@coderline/alphatab/model/ModelUtils';
import { MusicFontSymbol } from '@coderline/alphatab/model/MusicFontSymbol';
import { SpelledPitch } from '@coderline/alphatab/model/SpelledPitch';
import { CanvasHelper, type ICanvas, TextAlign, TextBaseline } from '@coderline/alphatab/platform/ICanvas';
import type { BarRendererBase } from '@coderline/alphatab/rendering/BarRendererBase';
import { AccidentalGlyph } from '@coderline/alphatab/rendering/glyphs/AccidentalGlyph';
import { Glyph } from '@coderline/alphatab/rendering/glyphs/Glyph';

/**
 * Draws the written name of a pitch: the step letter as text followed by the accidental as music symbol.
 * The y position is the vertical middle of the name.
 * @internal
 */
export class PitchNameGlyph extends Glyph {
    // keeps the accidental clear of the overhang of italic letters
    private static readonly _accidentalPaddingStaffSpaces = 0.15;

    private readonly _text: string;
    private readonly _font: Font;
    private readonly _accidental: MusicFontSymbol;
    private _textWidth: number = 0;

    /**
     * @param prefix A text drawn in front of the step letter.
     */
    public constructor(x: number, y: number, prefix: string, pitch: SpelledPitch, font: Font) {
        super(x, y);
        this._text = prefix + SpelledPitch.stepName(pitch.step);
        this._font = font;
        this._accidental = PitchNameGlyph.accidentalSymbol(pitch);
    }

    public override doLayout(): void {
        const canvas = this.renderer.scoreRenderer.canvas!;
        canvas.font = this._font;
        const size = this.renderer.scoreRenderer.layout!.textMeasures.measureText(canvas, this._text);
        this._textWidth = size.width;
        this.width = size.width + PitchNameGlyph.accidentalWidth(this.renderer, this._accidental);
        this.height = size.height;
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        canvas.font = this._font;
        const oldAlign = canvas.textAlign;
        const oldBaseLine = canvas.textBaseline;
        canvas.textAlign = TextAlign.Left;
        canvas.textBaseline = TextBaseline.Middle;
        canvas.fillText(this._text, cx + this.x, cy + this.y);
        canvas.textAlign = oldAlign;
        canvas.textBaseline = oldBaseLine;

        PitchNameGlyph.paintAccidental(canvas, this.renderer, cx + this.x + this._textWidth, cy + this.y, this._accidental);
    }

    /**
     * The music symbol for the accidental of the given pitch, {@link MusicFontSymbol.None} for naturals.
     */
    public static accidentalSymbol(pitch: SpelledPitch): MusicFontSymbol {
        return pitch.alter === 0
            ? MusicFontSymbol.None
            : AccidentalGlyph.getMusicSymbol(ModelUtils.accidentalOffsetToType(pitch.alter));
    }

    public static accidentalWidth(renderer: BarRendererBase, symbol: MusicFontSymbol): number {
        if (symbol === MusicFontSymbol.None) {
            return 0;
        }
        const metrics = renderer.smuflMetrics;
        return (
            PitchNameGlyph._accidentalPaddingStaffSpaces * metrics.oneStaffSpace +
            metrics.glyphWidths.get(symbol)! * metrics.tuningGlyphAccidentalScale
        );
    }

    /**
     * Paints the accidental symbol after the step letter ending at the given x position.
     * Like on a staff line, the origin of the symbol is placed on the given y position.
     */
    public static paintAccidental(
        canvas: ICanvas,
        renderer: BarRendererBase,
        x: number,
        middleY: number,
        symbol: MusicFontSymbol
    ): void {
        if (symbol === MusicFontSymbol.None) {
            return;
        }
        const metrics = renderer.smuflMetrics;
        CanvasHelper.fillMusicFontSymbolSafe(
            canvas,
            x + PitchNameGlyph._accidentalPaddingStaffSpaces * metrics.oneStaffSpace,
            middleY,
            metrics.tuningGlyphAccidentalScale,
            symbol,
            false
        );
    }
}
