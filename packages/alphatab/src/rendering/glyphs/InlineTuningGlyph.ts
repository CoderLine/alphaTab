import { TrackSubElement } from '@coderline/alphatab/model/Track';
import { Tuning } from '@coderline/alphatab/model/Tuning';
import { NotationElement } from '@coderline/alphatab/NotationSettings';
import { type ICanvas, TextAlign, TextBaseline } from '@coderline/alphatab/platform/ICanvas';
import { Glyph } from '@coderline/alphatab/rendering/glyphs/Glyph';
import type { LineBarRenderer } from '@coderline/alphatab/rendering/LineBarRenderer';
import type { RenderStaff } from '@coderline/alphatab/rendering/staves/RenderStaff';
import { ElementStyleHelper } from '@coderline/alphatab/rendering/utils/ElementStyleHelper';

/**
 * @internal
 */
export class InlineTuningGlyph extends Glyph {
    public readonly staff: RenderStaff;

    private readonly _tunings: number[];

    public constructor(staff: RenderStaff) {
        super(0, 0);
        this.staff = staff;
        this._tunings = staff.modelStaff.stringTuning.tunings;
    }

    public override doLayout(): void {
        const canvas = this.renderer.scoreRenderer.canvas!;
        const oldFont = canvas.font;
        canvas.font = this.renderer.resources.elementFonts.get(NotationElement.GuitarTuning)!;

        let textWidth = 0;
        for (const tuning of this._tunings) {
            textWidth = Math.max(textWidth, canvas.measureText(Tuning.getTextForTuning(tuning, false)).width);
        }

        canvas.font = oldFont;

        this.width = textWidth > 0 ? textWidth + this.renderer.settings.display.inlineTuningPaddingRight : 0;
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

        const textEndX = cx - this.renderer.settings.display.inlineTuningPaddingRight;

        using _ = ElementStyleHelper.track(canvas, TrackSubElement.StringTuning, this.staff.modelStaff.track, true);

        for (let i = 0, j = this._tunings.length; i < j; i++) {
            canvas.fillText(
                Tuning.getTextForTuning(this._tunings[i], false),
                textEndX,
                cy + this.renderer.y + (this.renderer as LineBarRenderer).getLineY(i)
            );
        }

        canvas.font = oldFont;
        canvas.textBaseline = oldBaseLine;
        canvas.textAlign = oldTextAlign;
    }
}
