import { NoteOrnament } from '@src/model/NoteOrnament';
import { MusicFontGlyph } from '@src/rendering/glyphs/MusicFontGlyph';
import { MusicFontSymbol } from '@src/model/MusicFontSymbol';
import type { ICanvas } from '@src/platform/ICanvas';

export class NoteOrnamentGlyph extends MusicFontGlyph {
    constructor(ornament: NoteOrnament) {
        super(0, 0, 1, NoteOrnamentGlyph.getSymbol(ornament));
        this.center = true;
    }

    private static getSymbol(ornament: NoteOrnament): MusicFontSymbol {
        switch (ornament) {
            case NoteOrnament.InvertedTurn:
                return MusicFontSymbol.OrnamentTurnInverted;
            case NoteOrnament.Turn:
                return MusicFontSymbol.OrnamentTurn;
            case NoteOrnament.UpperMordent:
                return MusicFontSymbol.OrnamentShortTrill;
            case NoteOrnament.LowerMordent:
                return MusicFontSymbol.OrnamentMordent;
        }
        return MusicFontSymbol.None;
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        super.paint(cx, cy + this.height - 4, canvas);
    }
}
