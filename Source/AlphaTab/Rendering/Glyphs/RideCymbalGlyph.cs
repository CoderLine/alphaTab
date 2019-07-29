namespace AlphaTab.Rendering.Glyphs
{
    internal class RideCymbalGlyph : MusicFontGlyph
    {
        private readonly bool _isGrace;

        public RideCymbalGlyph(float x, float y, bool isGrace)
            : base(x, y, isGrace ? NoteHeadGlyph.GraceScale : 1, MusicFontSymbol.NoteHarmonicWhole)
        {
            _isGrace = isGrace;
        }

        public override void DoLayout()
        {
            Width = 9 * (_isGrace ? NoteHeadGlyph.GraceScale : 1) * Scale;
        }
    }
}
