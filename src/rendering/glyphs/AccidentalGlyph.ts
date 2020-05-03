import { AccidentalType } from '@src/model/AccidentalType';
import { MusicFontGlyph } from '@src/rendering/glyphs/MusicFontGlyph';
import { MusicFontSymbol } from '@src/rendering/glyphs/MusicFontSymbol';
import { NoteHeadGlyph } from '@src/rendering/glyphs/NoteHeadGlyph';

export class AccidentalGlyph extends MusicFontGlyph {
    private _isGrace: boolean;

    public constructor(x: number, y: number, accidentalType: AccidentalType, isGrace: boolean = false) {
        super(x, y, isGrace ? NoteHeadGlyph.GraceScale : 1, AccidentalGlyph.getMusicSymbol(accidentalType));
        this._isGrace = false;
        this._isGrace = isGrace;
    }

    private static getMusicSymbol(accidentalType: AccidentalType): MusicFontSymbol {
        switch (accidentalType) {
            case AccidentalType.Natural:
                return MusicFontSymbol.AccidentalNatural;
            case AccidentalType.Sharp:
                return MusicFontSymbol.AccidentalSharp;
            case AccidentalType.Flat:
                return MusicFontSymbol.AccidentalFlat;
            case AccidentalType.NaturalQuarterNoteUp:
                return MusicFontSymbol.AccidentalQuarterToneNaturalArrowUp;
            case AccidentalType.SharpQuarterNoteUp:
                return MusicFontSymbol.AccidentalQuarterToneSharpArrowUp;
            case AccidentalType.FlatQuarterNoteUp:
                return MusicFontSymbol.AccidentalQuarterToneFlatArrowUp;
        }
        return MusicFontSymbol.None;
    }

    public doLayout(): void {
        this.width = 8 * (this._isGrace ? NoteHeadGlyph.GraceScale : 1) * this.scale;
    }
}
