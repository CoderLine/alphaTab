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

        public GlyphGroup(int x, int y)
            :base(x,y)
        {
        }

        public override void DoLayout()
        {
            if (Glyphs == null || Glyphs.Count == 0)
            {
                Width = 0;
                return;
            }

            var w = 0;
            for (int i = 0, j = Glyphs.Count; i < j; i++)
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
            if (Glyphs == null) Glyphs = new FastList<Glyph>();
            Glyphs.Add(g);
        }

        public override void Paint(int cx, int cy, ICanvas canvas)
        {
            if (Glyphs == null || Glyphs.Count == 0) return;
            for (int i = 0, j = Glyphs.Count; i < j; i++)
            {
                var g = Glyphs[i];
                g.Renderer = Renderer;
                g.Paint(cx + X, cy + Y, canvas);
            }
        }
    }
}
