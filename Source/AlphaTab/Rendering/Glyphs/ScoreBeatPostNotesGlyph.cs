namespace AlphaTab.Rendering.Glyphs
{
    public class ScoreBeatPostNotesGlyph : BeatGlyphBase
    {
        public override void DoLayout()
        {
            AddGlyph(new SpacingGlyph(0, 0, (int)(BeatDurationWidth * Scale)));
            base.DoLayout();
        }
    }
}
