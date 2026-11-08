import type { MusicFontSymbol } from '@coderline/alphatab/model/MusicFontSymbol';
import { SpelledPitch } from '@coderline/alphatab/model/SpelledPitch';
import { TrackSubElement } from '@coderline/alphatab/model/Track';
import type { Tuning } from '@coderline/alphatab/model/Tuning';
import { NotationElement } from '@coderline/alphatab/NotationSettings';
import { type ICanvas, TextAlign, TextBaseline } from '@coderline/alphatab/platform/ICanvas';
import { Glyph } from '@coderline/alphatab/rendering/glyphs/Glyph';
import { PitchNameGlyph } from '@coderline/alphatab/rendering/glyphs/PitchNameGlyph';
import type { LineBarRenderer } from '@coderline/alphatab/rendering/LineBarRenderer';
import type { RenderStaff } from '@coderline/alphatab/rendering/staves/RenderStaff';
import { ElementStyleHelper } from '@coderline/alphatab/rendering/utils/ElementStyleHelper';

/**
 * @internal
 */
export class InlineTuningGlyph extends Glyph {
    public readonly staff: RenderStaff;

    private readonly _tuning: Tuning;
    private _steps: string[] = [];
    private _accidentals: MusicFontSymbol[] = [];
    private _accidentalWidths: number[] = [];

    public constructor(staff: RenderStaff) {
        super(0, 0);
        this.staff = staff;
        this._tuning = staff.modelStaff.stringTuning;
    }

    public override doLayout(): void {
        const canvas = this.renderer.scoreRenderer.canvas!;
        const oldFont = canvas.font;
        canvas.font = this.renderer.resources.elementFonts.get(NotationElement.GuitarTuning)!;

        const textMeasures = this.renderer.scoreRenderer.layout!.textMeasures;
        const count = this._tuning.tunings.length;
        this._steps = new Array<string>(count);
        this._accidentals = new Array<MusicFontSymbol>(count);
        this._accidentalWidths = new Array<number>(count);

        let nameWidth = 0;
        for (let i = 0; i < count; i++) {
            const pitch = this._tuning.getSpelling(i);
            const step = SpelledPitch.stepName(pitch.step);
            const accidental = PitchNameGlyph.accidentalSymbol(pitch);
            const accidentalWidth = PitchNameGlyph.accidentalWidth(this.renderer, accidental);
            this._steps[i] = step;
            this._accidentals[i] = accidental;
            this._accidentalWidths[i] = accidentalWidth;
            nameWidth = Math.max(nameWidth, textMeasures.measureText(canvas, step).width + accidentalWidth);
        }

        canvas.font = oldFont;

        this.width = nameWidth > 0 ? nameWidth + this.renderer.settings.display.inlineTuningPaddingRight : 0;
        this.height = this.renderer.height;
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        if (this.width === 0) {
            return;
        }

        const oldFont = canvas.font;
        const oldBaseLine = canvas.textBaseline;
        const oldTextAlign = canvas.textAlign;

        canvas.font = this.renderer.resources.elementFonts.get(NotationElement.GuitarTuning)!;
        canvas.textBaseline = TextBaseline.Middle;
        canvas.textAlign = TextAlign.Right;

        const nameEndX = cx - this.renderer.settings.display.inlineTuningPaddingRight;

        using _ = ElementStyleHelper.track(canvas, TrackSubElement.StringTuning, this.staff.modelStaff.track, true);

        for (let i = 0, j = this._steps.length; i < j; i++) {
            const lineY = cy + this.renderer.y + (this.renderer as LineBarRenderer).getLineY(i);
            const stepEndX = nameEndX - this._accidentalWidths[i];
            canvas.fillText(this._steps[i], stepEndX, lineY);
            PitchNameGlyph.paintAccidental(canvas, this.renderer, stepEndX, lineY, this._accidentals[i]);
        }

        canvas.font = oldFont;
        canvas.textBaseline = oldBaseLine;
        canvas.textAlign = oldTextAlign;
    }
}
