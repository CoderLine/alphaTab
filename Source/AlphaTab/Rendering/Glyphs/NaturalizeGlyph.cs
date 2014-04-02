namespace AlphaTab.Rendering.Glyphs
{
    public class NaturalizeGlyph : SvgGlyph
    {
        private readonly bool _isGrace;

        public NaturalizeGlyph(int x = 0, int y = 0, bool isGrace = false)
            : base(x, y, MusicFont.AccidentalNatural, isGrace ? NoteHeadGlyph.GraceScale : 1, isGrace ? NoteHeadGlyph.GraceScale : 1)
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
