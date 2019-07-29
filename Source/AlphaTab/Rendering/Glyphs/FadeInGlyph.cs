using System;
using AlphaTab.Platform;

namespace AlphaTab.Rendering.Glyphs
{
    class FadeInGlyph : EffectGlyph
    {
        public FadeInGlyph(float x, float y)
            : base(x, y)
        {
        }

        public override void DoLayout()
        {
            base.DoLayout();
            Height = 17 * Scale;
        }

        public override void Paint(float cx, float cy, ICanvas canvas)
        {
            var size = 6 * Scale;
            var width = Math.Max(Width, 14 * Scale);

            var offset = Height / 2;

            canvas.BeginPath();
            canvas.MoveTo(cx + X, cy + Y + offset);
            canvas.QuadraticCurveTo(cx + X + (width / 2), cy + Y + offset, cx + X + width, cy + Y + offset - size);
            canvas.MoveTo(cx + X, cy + Y + offset);
            canvas.QuadraticCurveTo(cx + X + (width / 2), cy + Y + offset, cx + X + width, cy + Y + offset + size);
            canvas.Stroke();
        }
    }
}
