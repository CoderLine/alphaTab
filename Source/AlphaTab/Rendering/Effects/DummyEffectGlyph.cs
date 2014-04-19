using AlphaTab.Model;
using AlphaTab.Platform;
using AlphaTab.Rendering.Glyphs;

namespace AlphaTab.Rendering.Effects
{
    public class DummyEffectGlyph : EffectGlyph
    {
        private readonly string _s;

        public DummyEffectGlyph(int x, int y, string s)
            : base(x, y)
        {
            _s = s;
        }

        public override void DoLayout()
        {
            Width = (int)(20 * Scale);
        }

        public override bool CanScale
        {
            get { return false; }
        }

        public override void Paint(int cx, int cy, ICanvas canvas)
        {
            var res = Renderer.Resources;
            canvas.Color = res.MainGlyphColor;
            canvas.StrokeRect(cx + X, cy + Y, Width, 20 * Scale);
            canvas.Font = res.TablatureFont;
            canvas.FillText(_s, cx + X, cy + Y);
        }
    }
}
