using AlphaTab.Model;

namespace AlphaTab.Rendering.Glyphs
{
    public class TabBeatPreNotesGlyph : BeatGlyphBase
    {
        public override void DoLayout()
        {
            if (Container.Beat.BrushType != BrushType.None)
            {
                AddGlyph(new TabBrushGlyph(Container.Beat));
                AddGlyph(new SpacingGlyph(0, 0, (int)(4 * Scale), true));
            }
            base.DoLayout();
        }
    }
}
