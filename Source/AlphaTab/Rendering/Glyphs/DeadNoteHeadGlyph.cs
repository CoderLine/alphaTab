namespace AlphaTab.Rendering.Glyphs
{
    internal class DeadNoteHeadGlyph : MusicFontGlyph
    {
        private readonly bool _isGrace;

        public DeadNoteHeadGlyph(float x, float y, bool isGrace)
            : base(x, y, isGrace ? NoteHeadGlyph.GraceScale : 1, MusicFontSymbol.NoteDead)
        {
            _isGrace = isGrace;
        }

        public override void DoLayout()
        {
            Width = 9 * (_isGrace ? NoteHeadGlyph.GraceScale : 1) * Scale;
        }
    }
}
