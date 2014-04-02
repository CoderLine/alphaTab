namespace AlphaTab.Rendering.Glyphs
{
    public class ChineseCymbalGlyph : SvgGlyph
    {
        private readonly bool _isGrace;

        public ChineseCymbalGlyph(int x, int y, bool isGrace)
            : base(x, y, MusicFont.NoteHarmonic, isGrace ? NoteHeadGlyph.GraceScale : 1, isGrace ? NoteHeadGlyph.GraceScale : 1)
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
