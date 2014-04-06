namespace AlphaTab.Rendering.Glyphs
{
    public class SharpGlyph : SvgGlyph
    {
        private readonly bool _isGrace;

        public SharpGlyph(int x, int y, bool isGrace = false)
            : base(x, y, MusicFont.AccidentalSharp, isGrace ? NoteHeadGlyph.GraceScale : 1, isGrace ? NoteHeadGlyph.GraceScale : 1)
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
