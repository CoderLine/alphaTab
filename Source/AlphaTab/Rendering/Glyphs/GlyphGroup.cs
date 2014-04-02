using System;
using System.Collections.Generic;
using AlphaTab.Platform;

namespace AlphaTab.Rendering.Glyphs
{
    /// <summary>
    /// This glyph allows to group several other glyphs to be
    /// drawn at the same x position
    /// </summary>
    public class GlyphGroup : Glyph
    {
        protected List<Glyph> Glyphs;

        public GlyphGroup(int x = 0, int y = 0, List<Glyph> glyphs = null)
            :base(x,y)
        {
            Glyphs = glyphs ?? new List<Glyph>();

        }

        public override void DoLayout()
        {
            var w = 0;
            foreach (var g in Glyphs)
            {
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
            foreach (var g in Glyphs)
            {
                g.Renderer = Renderer;
                g.Paint(cx + X, cy + Y, canvas);
            }
        }
    }
}
