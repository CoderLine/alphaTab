import { Duration } from '@src/model/Duration';
import { MusicFontGlyph } from '@src/rendering/glyphs/MusicFontGlyph';
import { MusicFontSymbol } from '@src/model/MusicFontSymbol';
import type { ICanvas } from '@src/platform/ICanvas';

export class NoteHeadGlyph extends MusicFontGlyph {
    // TODO: SmuFL
    public static readonly GraceScale: number = 0.75;

    public centerOnStem = false;

    public constructor(x: number, y: number, duration: Duration, isGrace: boolean) {
        super(x, y, isGrace ? NoteHeadGlyph.GraceScale : 1, NoteHeadGlyph.getSymbol(duration));
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        if (this.centerOnStem) {
            this.center = true;
        }
        super.paint(cx, cy, canvas);
    }

    private static getSymbol(duration: Duration): MusicFontSymbol {
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
