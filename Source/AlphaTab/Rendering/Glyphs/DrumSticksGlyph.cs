namespace AlphaTab.Rendering.Glyphs
{
    class DrumSticksGlyph : MusicFontGlyph
    {
        private readonly bool _isGrace;

        public DrumSticksGlyph(float x, float y, bool isGrace)
            : base(x, y, isGrace ? NoteHeadGlyph.GraceScale : 1, MusicFontSymbol.NoteSideStick)
        {
            _isGrace = isGrace;
        }

        public override void DoLayout()
        {
            Width = 9 * (_isGrace ? NoteHeadGlyph.GraceScale : 1) * Scale;
        }
    }
}
