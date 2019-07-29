namespace AlphaTab.Rendering.Glyphs
{
    class HiHatGlyph : MusicFontGlyph
    {
        private readonly bool _isGrace;

        public HiHatGlyph(float x, float y, bool isGrace)
            : base(x, y, isGrace ? NoteHeadGlyph.GraceScale : 1, MusicFontSymbol.NoteHiHat)
        {
            _isGrace = isGrace;
        }

        public override void DoLayout()
        {
            Width = 9 * (_isGrace ? NoteHeadGlyph.GraceScale : 1) * Scale;
        }
    }
}
