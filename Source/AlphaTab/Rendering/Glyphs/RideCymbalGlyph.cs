namespace AlphaTab.Rendering.Glyphs
{
    public class RideCymbalGlyph : MusicFontGlyph
    {
        private readonly bool _isGrace;

        public RideCymbalGlyph(int x, int y, bool isGrace)
            : base(x, y, isGrace ? NoteHeadGlyph.GraceScale : 1, MusicFontSymbol.NoteRideCymbal)
        {
            _isGrace = isGrace;
        }

        public override void DoLayout()
        {
            Width = (int)(9 * (_isGrace ? NoteHeadGlyph.GraceScale : 1) * Scale);
        }

        public override bool CanScale
        {
            get { return false; }
        }
    }
}
