import { AccidentalType } from '@src/model/AccidentalType';
import { MusicFontGlyph } from '@src/rendering/glyphs/MusicFontGlyph';
import { MusicFontSymbol } from '@src/model/MusicFontSymbol';

export class AccidentalGlyph extends MusicFontGlyph {
    private _accidentalType: AccidentalType;

    public constructor(x: number, y: number, accidentalType: AccidentalType, scale: number) {
        super(x, y, scale, AccidentalGlyph.getMusicSymbol(accidentalType));
        this._accidentalType = accidentalType;
    }

    public static getMusicSymbol(accidentalType: AccidentalType): MusicFontSymbol {
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
            case AccidentalType.DoubleSharp:
                return MusicFontSymbol.AccidentalDoubleSharp;
            case AccidentalType.DoubleFlat:
                return MusicFontSymbol.AccidentalDoubleFlat;
        }
        return MusicFontSymbol.None;
    }

    public override doLayout(): void {
        switch (this._accidentalType) {
            case AccidentalType.DoubleFlat:
                this.width = 18;
                break;
            default:
                this.width = 8;
                break;
        }
        this.width = this.width * this.glyphScale * this.scale;
    }
}
