using AlphaTab.Platform;
using AlphaTab.Rendering.Glyphs;

namespace AlphaTab.Rendering.Effects
{
    class DummyEffectGlyph : EffectGlyph
    {
        private readonly string _s;

        public DummyEffectGlyph(float x, float y, string s)
            : base(x, y)
        {
            _s = s;
        }

        public override void DoLayout()
        {
            Width = 20 * Scale;
        }

        public override void Paint(float cx, float cy, ICanvas canvas)
        {
            var res = Renderer.Resources;
            canvas.StrokeRect(cx + X, cy + Y, Width, 20 * Scale);
            canvas.Font = res.TablatureFont;
            canvas.FillText(_s, cx + X, cy + Y);
        }
    }
}
