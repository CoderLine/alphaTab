import type { EngravingSettings } from '@coderline/alphatab/EngravingSettings';
import { AccidentalType } from '@coderline/alphatab/model/AccidentalType';
import { type Beat, BeatSubElement } from '@coderline/alphatab/model/Beat';
import { MusicFontSymbol } from '@coderline/alphatab/model/MusicFontSymbol';
import { type Note, NoteSubElement } from '@coderline/alphatab/model/Note';
import { CanvasHelper, type ICanvas, TextAlign, TextBaseline } from '@coderline/alphatab/platform/ICanvas';
import type { AccidentalGlyph } from '@coderline/alphatab/rendering/glyphs/AccidentalGlyph';
import type { AugmentationDotGlyph } from '@coderline/alphatab/rendering/glyphs/AugmentationDotGlyph';
import { Glyph } from '@coderline/alphatab/rendering/glyphs/Glyph';
import { ElementStyleHelper } from '@coderline/alphatab/rendering/utils/ElementStyleHelper';

/**
 * The number of a single note (or rest) in numbered notation including its octave dots.
 * @internal
 */
export class NumberedNoteHeadGlyph extends Glyph {
    private _isGrace: boolean;
    private _beat: Beat;
    private _number: string;
    private _octaveDotsY: number = 0;
    private _octaveDotHeight: number = 0;

    /**
     * The note this number represents, null for rests.
     */
    public readonly note: Note | null;

    /**
     * The octave dots of the number: positive values above the number, negative values below.
     */
    public readonly octaveDots: number;

    /**
     * The position of the number on the jianpu scale (octave * 7 + degree), used to stack chords.
     */
    public readonly step: number;

    /**
     * The space between the number and its low octave dots, taken by the duration underlines.
     */
    public underlinesHeight: number = 0;

    /**
     * The accidental the note needs in front of the number.
     */
    public accidentalType: AccidentalType = AccidentalType.None;

    /**
     * The accidental written in front of the number, positioned at the number.
     */
    public accidental: AccidentalGlyph | null = null;

    /**
     * The augmentation dots written after the number of a chord, positioned at the number.
     */
    public dots: AugmentationDotGlyph[] | null = null;

    public constructor(
        x: number,
        y: number,
        number: string,
        isGrace: boolean,
        beat: Beat,
        note: Note | null,
        octaveDots: number,
        step: number
    ) {
        super(x, y);
        this._isGrace = isGrace;
        this._number = number;
        this._beat = beat;
        this.note = note;
        this.octaveDots = octaveDots;
        this.step = step;
    }

    /**
     * Moves the accidental and the augmentation dots to the number.
     * @param offsetY The position of the parent of the number within the beat glyph.
     */
    public updateAttachedY(offsetY: number): void {
        const y = offsetY + this.y;
        const accidental = this.accidental;
        if (accidental) {
            accidental.y = y;
        }
        const dots = this.dots;
        if (dots) {
            for (const d of dots) {
                d.y = y;
            }
        }
    }

    /**
     * The distance from the vertical center of a number to the top of the number or its octave dots above.
     */
    public static getTopExtent(settings: EngravingSettings, numberHeight: number, octaveDots: number): number {
        const extent = numberHeight / 2;
        if (octaveDots <= 0) {
            return extent;
        }
        const dotsExtent =
            extent +
            octaveDots * settings.glyphHeights.get(MusicFontSymbol.AugmentationDot)! * 2 +
            settings.glyphTop.get(MusicFontSymbol.AugmentationDot)!;
        return Math.max(dotsExtent, extent);
    }

    /**
     * The distance from the vertical center of a number to the bottom of the number or its octave dots below.
     */
    public static getBottomExtent(
        settings: EngravingSettings,
        numberHeight: number,
        octaveDots: number,
        underlinesHeight: number
    ): number {
        const extent = numberHeight / 2;
        if (octaveDots >= 0) {
            return extent;
        }
        const dotHeight = settings.glyphHeights.get(MusicFontSymbol.AugmentationDot)!;
        const dotsExtent =
            extent +
            underlinesHeight +
            dotHeight +
            settings.glyphTop.get(MusicFontSymbol.AugmentationDot)! +
            -octaveDots * dotHeight * 2;
        return Math.max(dotsExtent, extent);
    }

    public override getBoundingBoxTop(): number {
        return (
            this.y -
            NumberedNoteHeadGlyph.getTopExtent(this.renderer.resources.engravingSettings, this.height, this.octaveDots)
        );
    }

    public override getBoundingBoxBottom(): number {
        return (
            this.y +
            NumberedNoteHeadGlyph.getBottomExtent(
                this.renderer.resources.engravingSettings,
                this.height,
                this.octaveDots,
                this.underlinesHeight
            )
        );
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        const previousColor = this.note
            ? ElementStyleHelper.applyNote(canvas, NoteSubElement.NumberedNumber, this.note)
            : this._beat.isRest
              ? ElementStyleHelper.applyBeat(canvas, BeatSubElement.NumberedRests, this._beat)
              : undefined;
        try {
            const res = this.renderer.resources;
            canvas.font = this._isGrace ? res.numberedNotationGraceFont : res.numberedNotationFont;
            const baseline = canvas.textBaseline;
            canvas.textBaseline = TextBaseline.Middle;
            canvas.textAlign = TextAlign.Left;
            canvas.fillText(this._number.toString(), cx + this.x, cy + this.y);
            canvas.textBaseline = baseline;

            const dotCount = Math.abs(this.octaveDots);
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
        } finally {
            ElementStyleHelper.restore(canvas, previousColor);
        }
    }

    public override doLayout(): void {
        const res = this.renderer.resources;
        const font = this._isGrace ? res.numberedNotationGraceFont : res.numberedNotationFont;
        const c = this.renderer.scoreRenderer.canvas!;
        c.font = font;
        const size = this.renderer.scoreRenderer.layout!.textMeasures.measureText(c, this._number);
        this.height = size.height;
        this.width = size.width;

        const dotCount = this.octaveDots;

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
                // low octave dots go below the duration underlines
                this.underlinesHeight +
                // one for the padding
                dotHeight +
                // align the dots
                res.engravingSettings.glyphTop.get(MusicFontSymbol.AugmentationDot)!;
        }
        this._octaveDotHeight = dotHeight;
    }
}
