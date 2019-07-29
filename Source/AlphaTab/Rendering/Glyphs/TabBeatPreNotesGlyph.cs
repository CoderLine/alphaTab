using AlphaTab.Model;

namespace AlphaTab.Rendering.Glyphs
{
    internal class TabBeatPreNotesGlyph : BeatGlyphBase
    {
        public override void DoLayout()
        {
            if (Container.Beat.BrushType != BrushType.None && !Container.Beat.IsRest)
            {
                AddGlyph(new TabBrushGlyph(Container.Beat));
                AddGlyph(new SpacingGlyph(0, 0, 4 * Scale));
            }

            base.DoLayout();
        }
    }
}
