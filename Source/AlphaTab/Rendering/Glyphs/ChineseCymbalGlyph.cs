namespace AlphaTab.Rendering.Glyphs
{
    internal class ChineseCymbalGlyph : MusicFontGlyph
    {
        private readonly bool _isGrace;

        public ChineseCymbalGlyph(float x, float y, bool isGrace)
            : base(x, y, isGrace ? NoteHeadGlyph.GraceScale : 1, MusicFontSymbol.NoteHarmonic)
        {
            _isGrace = isGrace;
        }

        public override void DoLayout()
        {
            Width = 9 * (_isGrace ? NoteHeadGlyph.GraceScale : 1) * Scale;
        }
    }
}
