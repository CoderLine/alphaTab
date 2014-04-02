namespace AlphaTab.Rendering.Glyphs
{
    public class DeadNoteHeadGlyph : SvgGlyph
    {
        private readonly bool _isGrace;

        public DeadNoteHeadGlyph(int x, int y, bool isGrace)
            : base(x, y, MusicFont.NoteDead, isGrace ? NoteHeadGlyph.GraceScale : 1, isGrace ? NoteHeadGlyph.GraceScale : 1)
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
