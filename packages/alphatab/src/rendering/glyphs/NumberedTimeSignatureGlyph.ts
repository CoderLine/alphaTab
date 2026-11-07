import { VoiceSubElement } from '@coderline/alphatab/model/Voice';
import type { ICanvas } from '@coderline/alphatab/platform/ICanvas';
import { ScoreTimeSignatureGlyph } from '@coderline/alphatab/rendering/glyphs/ScoreTimeSignatureGlyph';
import type { NumberedBarRenderer } from '@coderline/alphatab/rendering/NumberedBarRenderer';
import { ElementStyleHelper } from '@coderline/alphatab/rendering/utils/ElementStyleHelper';

/**
 * The time signature of a numbered staff, written in front of every voice row of the bar.
 * The copies in front of further voices take the colour of their voice, a bar style applies to all copies.
 * Its bounding box covers the first row only.
 * @internal
 */
export class NumberedTimeSignatureGlyph extends ScoreTimeSignatureGlyph {
    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        // the rows are final only once the staff is aligned in its system
        const renderer = this.renderer as NumberedBarRenderer;
        const firstRowY = renderer.getLineY(0);
        const voices = renderer.bar.voices;
        for (let v = 0; v < voices.length; v++) {
            if (!renderer.isRowWritten(v)) {
                continue;
            }
            const previousColor =
                v > 0 ? ElementStyleHelper.applyVoice(canvas, VoiceSubElement.Glyphs, voices[v], true) : undefined;
            try {
                super.paint(cx, cy + renderer.getVoiceLineY(v) - firstRowY, canvas);
            } finally {
                ElementStyleHelper.restore(canvas, previousColor);
            }
        }
    }
}
