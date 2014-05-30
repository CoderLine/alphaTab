namespace AlphaTab.Rendering.Glyphs
{
    public class NaturalizeGlyph : MusicFontGlyph
    {
        private readonly bool _isGrace;

        public NaturalizeGlyph(int x, int y, bool isGrace = false)
            : base(x, y, isGrace ? NoteHeadGlyph.GraceScale : 1, MusicFontSymbol.AccidentalNatural)
        {
            _isGrace = isGrace;
        }

        public override void DoLayout()
        {
            Width = (int)(8 * (_isGrace ? NoteHeadGlyph.GraceScale : 1) * Scale);
        }

        public override bool CanScale
        {
            get { return false; }
        }
    }
}
