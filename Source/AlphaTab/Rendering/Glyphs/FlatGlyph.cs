namespace AlphaTab.Rendering.Glyphs
{
    public class FlatGlyph : SvgGlyph
    {
        private readonly bool _isGrace;

        public FlatGlyph(int x = 0, int y = 0, bool isGrace = false)
            : base(x, y, MusicFont.AccidentalFlat, isGrace ? NoteHeadGlyph.GraceScale : 1, isGrace ? NoteHeadGlyph.GraceScale : 1)
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
