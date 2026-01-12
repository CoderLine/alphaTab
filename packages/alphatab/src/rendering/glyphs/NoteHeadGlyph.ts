import { Duration } from '@coderline/alphatab/model/Duration';
import { MusicFontGlyph } from '@coderline/alphatab/rendering/glyphs/MusicFontGlyph';
import { MusicFontSymbol } from '@coderline/alphatab/model/MusicFontSymbol';
import type { ICanvas } from '@coderline/alphatab/platform/ICanvas';
import { EngravingSettings } from '@coderline/alphatab/EngravingSettings';

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
