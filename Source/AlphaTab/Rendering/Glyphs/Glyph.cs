using AlphaTab.Platform;

namespace AlphaTab.Rendering.Glyphs
{
    /// <summary>
    /// A glyph is a single symbol which can be added to a GlyphBarRenderer for automated
    /// layouting and drawing of stacked symbols.
    /// </summary>
    public class Glyph
    {
        public int Index { get; set; }
        public int X { get; set; }
        public int Y { get; set; }
        public int Width { get; set; }
        public BarRendererBase Renderer { get; set; }

        public Glyph(int x, int y)
        {
            X = x;
            Y = y;
        }

        public virtual void ApplyGlyphSpacing(int spacing)
        {
            if (CanScale)
            {
                Width += spacing;
            }
        }

        public virtual bool CanScale
        {
            get
            {
                return true;
            }
        }

        public float Scale
        {
            get
            {
                return Renderer.Scale;
            }
        }

        public virtual void DoLayout()
        {

        }

        public virtual void Paint(int cx, int cy, ICanvas canvas)
        {
        }
    }
}
