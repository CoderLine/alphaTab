using System;
using AlphaTab.Collections;
using AlphaTab.Platform;

namespace AlphaTab.Rendering.Glyphs
{
    /// <summary>
    /// This glyph allows to group several other glyphs to be
    /// drawn at the same x position
    /// </summary>
    public class GlyphGroup : Glyph
    {
        protected FastList<Glyph> Glyphs;

        public GlyphGroup(int x, int y, FastList<Glyph> glyphs)
            :base(x,y)
        {
            Glyphs = glyphs ?? new FastList<Glyph>();

        }

        public override void DoLayout()
        {
            var w = 0;
            for (int i = 0; i < Glyphs.Count; i++)
            {
                var g = Glyphs[i];
                g.Renderer = Renderer;
                g.DoLayout();
                w = Math.Max(w, g.Width);
            }
            Width = w;
        }

        public virtual void AddGlyph(Glyph g)
        {
            Glyphs.Add(g);
        }

        public override void Paint(int cx, int cy, ICanvas canvas)
        {
            for (int i = 0; i < Glyphs.Count; i++)
            {
                var g = Glyphs[i];
                g.Renderer = Renderer;
                g.Paint(cx + X, cy + Y, canvas);
            }
        }
    }
}
