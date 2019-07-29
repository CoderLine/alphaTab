using AlphaTab.Model;

namespace AlphaTab.Rendering.Glyphs
{
    internal class DiamondNoteHeadGlyph : MusicFontGlyph
    {
        private readonly bool _isGrace;

        public DiamondNoteHeadGlyph(float x, float y, Duration duration, bool isGrace)
            : base(x, y, isGrace ? NoteHeadGlyph.GraceScale : 1, GetSymbol(duration))
        {
            _isGrace = isGrace;
        }

        private static MusicFontSymbol GetSymbol(Duration duration)
        {
            switch (duration)
            {
                case Duration.QuadrupleWhole:
                case Duration.DoubleWhole:
                case Duration.Whole:
                case Duration.Half:
                    return MusicFontSymbol.NoteHarmonicWhole;
                default:
                    return MusicFontSymbol.NoteHarmonic;
            }
        }

        public override void DoLayout()
        {
            Width = 9 * (_isGrace ? NoteHeadGlyph.GraceScale : 1) * Scale;
        }
    }
}
