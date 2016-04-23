using AlphaTab.Collections;

namespace AlphaTab.Rendering.Glyphs
{
    public class LeftToRightLayoutingGlyphGroup : GlyphGroup
    {
        public LeftToRightLayoutingGlyphGroup()
            : base(0,0)
        {
            Glyphs = new FastList<Glyph>();
        }

        public override void AddGlyph(Glyph g)
        {
            g.X = Glyphs.Count == 0 
                ? 0 
                : (Glyphs[Glyphs.Count - 1].X + Glyphs[Glyphs.Count - 1].Width);
            g.Renderer = Renderer;
            g.DoLayout();
            Width = g.X + g.Width;
            base.AddGlyph(g);
        }
    }
}