import type { Beat } from '@coderline/alphatab/model/Beat';
import type { Font } from '@coderline/alphatab/model/Font';
import { type ICanvas, TextAlign } from '@coderline/alphatab/platform/ICanvas';
import { BeatXPosition } from '@coderline/alphatab/rendering/BeatXPosition';
import { TextGlyph } from '@coderline/alphatab/rendering/glyphs/TextGlyph';

/**
 * The label of hammer-ons, pull-offs and legato slides (H, P, sl.) shown above the staff.
 * @remarks
 * The glyph belongs to the beat where the effect starts, but the label is centered between
 * this beat and the beat where the effect ends (or the end of the system for effects continuing
 * on the next system). The offset to this center is resolved via {@link resolveOffset} once all bars
 * of the system have their final positions.
 *
 * For the vertical placement the glyph reports the whole segment (start to end beat) as its extent,
 * so the label is placed above everything on the segment (e.g. fret numbers sticking out of the tab staff)
 * and not only above the gap between the notes.
 * @internal
 */
export class EffectSlurLabelGlyph extends TextGlyph {
    private _endBeat: Beat;
    private _labelOffset: number = 0;
    private _segmentStart: number = 0;
    private _segmentEnd: number = 0;

    public constructor(text: string, font: Font, endBeat: Beat) {
        super(0, 0, text, font, TextAlign.Center);
        this._endBeat = endBeat;
    }

    /**
     * Centers the label between its beat and the end beat (or the end of the system).
     */
    public resolveOffset(): void {
        const renderer = this.renderer;
        const staff = renderer.staff!;
        const startX = renderer.x + renderer.getBeatX(this.beat!, BeatXPosition.MiddleNotes);

        let endX: number;
        const endRenderer = renderer.scoreRenderer.layout!.getRendererForBar(staff.staffId, this._endBeat.voice.bar);
        if (endRenderer && endRenderer.staff === staff) {
            endX = endRenderer.x + endRenderer.getBeatX(this._endBeat, BeatXPosition.MiddleNotes);
        } else {
            // continued on the next system: center up to the end of this system
            const lastRenderer = staff.barRenderers[staff.barRenderers.length - 1];
            endX = lastRenderer.x + lastRenderer.width;
        }

        this._labelOffset = (startX + endX) / 2 - (renderer.x + this.x);
        this._segmentStart = startX - renderer.x;
        this._segmentEnd = endX - renderer.x;
    }

    public override getBoundingBoxLeft(): number {
        return Math.min(super.getBoundingBoxLeft() + this._labelOffset, this._segmentStart);
    }

    public override getBoundingBoxRight(): number {
        return Math.max(super.getBoundingBoxRight() + this._labelOffset, this._segmentEnd);
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        super.paint(cx + this._labelOffset, cy, canvas);
    }
}
