using AlphaTab.Platform;

namespace AlphaTab.Rendering.Glyphs
{
    /// <summary>
    /// A glyph is a single symbol which can be added to a GlyphBarRenderer for automated
    /// layouting and drawing of stacked symbols.
    /// </summary>
    internal class Glyph
    {
        public float X { get; set; }
        public float Y { get; set; }
        public float Width { get; set; }
        public BarRendererBase Renderer { get; set; }

        public Glyph(float x, float y)
        {
            X = x;
            Y = y;
        }

        public float Scale => Renderer.Scale;

        public virtual void DoLayout()
        {

        }

        public virtual void Paint(float cx, float cy, ICanvas canvas)
        {
        }
    }
}
