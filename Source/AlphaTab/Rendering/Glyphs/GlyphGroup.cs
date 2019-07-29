using System;
using AlphaTab.Collections;
using AlphaTab.Platform;

namespace AlphaTab.Rendering.Glyphs
{
    /// <summary>
    /// This glyph allows to group several other glyphs to be
    /// drawn at the same x position
    /// </summary>
    class GlyphGroup : Glyph
    {
        protected FastList<Glyph> Glyphs;

        public bool IsEmpty
        {
            get { return Glyphs == null || Glyphs.Count == 0; }
        }

        public GlyphGroup(float x, float y)
            : base(x, y)
        {
        }

        public override void DoLayout()
        {
            if (Glyphs == null || Glyphs.Count == 0)
            {
                Width = 0;
                return;
            }

            var w = 0f;
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

        public override void Paint(float cx, float cy, ICanvas canvas)
        {
            var glyphs = Glyphs;
            if (glyphs == null || glyphs.Count == 0) return;
            foreach (var g in glyphs)
            {
                g.Paint(cx + X, cy + Y, canvas);
            }
        }
    }
}
