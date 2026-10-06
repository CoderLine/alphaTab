import { EngravingSettings } from '@coderline/alphatab/EngravingSettings';
import { Duration } from '@coderline/alphatab/model/Duration';
import { MusicFontSymbol } from '@coderline/alphatab/model/MusicFontSymbol';
import type { ICanvas } from '@coderline/alphatab/platform/ICanvas';
import { NoteYPosition } from '@coderline/alphatab/rendering/BarRendererBase';
import { MusicFontGlyph } from '@coderline/alphatab/rendering/glyphs/MusicFontGlyph';
import { BeamDirection } from '@coderline/alphatab/rendering/utils/BeamDirection';

/**
 * @internal
 */
export class NoteHeadGlyphBase extends MusicFontGlyph {
    public centerOnStem = false;
    public constructor(x: number, y: number, isGrace: boolean, symbol: MusicFontSymbol) {
        super(x, y, isGrace ? EngravingSettings.GraceScale : 1, symbol);
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        if (this.centerOnStem) {
            this.center = true;
        }
        super.paint(cx, cy, canvas);
    }

    /**
     * Gets the x-offset from the left of the note head at which a stem in the given direction attaches.
     * @remarks The metrics are passed explicitly as positions are also requested before the note head is laid out.
     */
    public getStemX(smufl: EngravingSettings, direction: BeamDirection): number {
        if (direction === BeamDirection.Up) {
            // stem-up attaches on the right side
            return (
                (smufl.stemUp.has(this.symbol)
                    ? smufl.stemUp.get(this.symbol)!.x
                    : smufl.glyphWidths.get(this.symbol)!) * this.glyphScale
            );
        }
        // stem-down attaches on the left side
        return (smufl.stemDown.has(this.symbol) ? smufl.stemDown.get(this.symbol)!.x : 0) * this.glyphScale;
    }

    /**
     * Gets the y-position of the note head at the given position (in the same coordinate space as {@link y}).
     * Positions depending on the stem length cannot be resolved by the note head and
     * are treated like {@link NoteYPosition.Top} and {@link NoteYPosition.Bottom}.
     * @remarks The metrics are passed explicitly as positions are also requested before the note head is laid out.
     */
    public getNoteHeadY(smufl: EngravingSettings, requestedPosition: NoteYPosition): number {
        switch (requestedPosition) {
            case NoteYPosition.TopWithStem:
            case NoteYPosition.Top:
                return this.y - this.height / 2;
            case NoteYPosition.BottomWithStem:
            case NoteYPosition.Bottom:
                return this.y + this.height / 2;
            case NoteYPosition.StemUp:
                return (
                    this.y -
                    (smufl.stemUp.has(this.symbol) ? smufl.stemUp.get(this.symbol)!.bottomY : 0) * this.glyphScale
                );
            case NoteYPosition.StemDown:
                return (
                    this.y -
                    (smufl.stemDown.has(this.symbol)
                        ? smufl.stemDown.get(this.symbol)!.topY
                        : -smufl.glyphHeights.get(this.symbol)! / 2) *
                        this.glyphScale
                );
        }
        return this.y;
    }
}

/**
 * @internal
 */
export class NoteHeadGlyph extends NoteHeadGlyphBase {
    public constructor(x: number, y: number, duration: Duration, isGrace: boolean) {
        super(x, y, isGrace, NoteHeadGlyph.getSymbol(duration));
    }

    public static getSymbol(duration: Duration): MusicFontSymbol {
        switch (duration) {
            case Duration.QuadrupleWhole:
                return MusicFontSymbol.NoteheadDoubleWholeSquare;
            case Duration.DoubleWhole:
                return MusicFontSymbol.NoteheadDoubleWhole;
            case Duration.Whole:
                return MusicFontSymbol.NoteheadWhole;
            case Duration.Half:
                return MusicFontSymbol.NoteheadHalf;
            default:
                return MusicFontSymbol.NoteheadBlack;
        }
    }
}
