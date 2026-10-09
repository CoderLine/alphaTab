import type { Beat } from '@coderline/alphatab/model/Beat';
import type { Font } from '@coderline/alphatab/model/Font';
import { type ICanvas, TextAlign } from '@coderline/alphatab/platform/ICanvas';
import { BeatXPosition } from '@coderline/alphatab/rendering/BeatXPosition';
import { EffectGlyph } from '@coderline/alphatab/rendering/glyphs/EffectGlyph';
import { TextGlyph } from '@coderline/alphatab/rendering/glyphs/TextGlyph';

/**
 * The label of hammer-ons, pull-offs and legato slides (H, P, sl.) shown above the staff.
 * @remarks
 * The glyph belongs to the beat where the effect starts, but the label is centered between
 * this beat and the beat where the effect ends (or the end of the system for effects continuing
 * on the next system). The offset to this center is resolved via {@link resolveOffset} once all bars
 * of the system have their final positions.
 *
 * In the vertical placement the label keeps its whole segment (start to end beat) clear, so it is placed
 * above everything on the segment (e.g. fret numbers sticking out of the tab staff), but it only occupies
 * the range of its text, so other markers can share the row next to it.
 *
 * Several labels of one beat (e.g. H on one string, P on another) are stacked with the usual effect band
 * padding between them, as if they were separate bands.
 * @internal
 */
export class EffectSlurLabelGlyph extends EffectGlyph {
    private _endBeat: Beat;
    private _texts: string[];
    private _font: Font;
    private _lines: TextGlyph[] = [];
    private _labelOffset: number = 0;
    private _segmentStart: number = 0;
    private _segmentEnd: number = 0;

    public constructor(lines: string[], font: Font, endBeat: Beat) {
        super(0, 0);
        this._endBeat = endBeat;
        this._texts = lines;
        this._font = font;
    }

    public override doLayout(): void {
        const padding = this.renderer.settings.display.effectBandPaddingBottom;
        let y = 0;
        let width = 0;
        this._lines = [];
        for (const text of this._texts) {
            const line = new TextGlyph(0, 0, text, this._font, TextAlign.Center);
            this._lines.push(line);
            line.renderer = this.renderer;
            line.y = y;
            line.doLayout();
            y += line.height + padding;
            if (line.width > width) {
                width = line.width;
            }
        }
        this.width = width;
        this.height = this._lines.length > 0 ? y - padding : 0;
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
        return this.x + this._labelOffset - this.width / 2;
    }

    public override getBoundingBoxRight(): number {
        return this.x + this._labelOffset + this.width / 2;
    }

    public override getPlacementClearanceLeft(): number {
        return Math.min(this.getBoundingBoxLeft(), this._segmentStart);
    }

    public override getPlacementClearanceRight(): number {
        return Math.max(this.getBoundingBoxRight(), this._segmentEnd);
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        for (const line of this._lines) {
            line.paint(cx + this.x + this._labelOffset, cy + this.y, canvas);
        }
    }
}
