using System;
using AlphaTab.Model;

namespace AlphaTab.Rendering.Glyphs
{
    class AccidentalGlyph : MusicFontGlyph
    {
        private readonly bool _isGrace;

        public AccidentalGlyph(float x, float y, AccidentalType accidentalType, bool isGrace = false)
            : base(x, y, isGrace ? NoteHeadGlyph.GraceScale : 1,GetMusicSymbol(accidentalType))
        {
            _isGrace = isGrace;
        }

        private static MusicFontSymbol GetMusicSymbol(AccidentalType accidentalType)
        {
            switch (accidentalType)
            {
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

        public override void DoLayout()
        {
            Width = 8 * (_isGrace ? NoteHeadGlyph.GraceScale : 1) * Scale;
        }
    }
}
