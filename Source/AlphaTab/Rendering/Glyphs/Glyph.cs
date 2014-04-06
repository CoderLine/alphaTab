using System.Runtime.CompilerServices;
using AlphaTab.Platform;

namespace AlphaTab.Rendering.Glyphs
{
    /// <summary>
    /// A glyph is a single symbol which can be added to a GlyphBarRenderer for automated
    /// layouting and drawing of stacked symbols.
    /// </summary>
    public class Glyph
    {
        [IntrinsicProperty]
        public int Index { get; set; }
        [IntrinsicProperty]
        public int X { get; set; }
        [IntrinsicProperty]
        public int Y { get; set; }
        [IntrinsicProperty]
        public int Width { get; set; }
        [IntrinsicProperty]
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
