using System;
using AlphaTab.Platform;

namespace AlphaTab.Rendering.Glyphs
{
    internal class TrillGlyph : EffectGlyph
    {
        public TrillGlyph(float x, float y)
            : base(x, y)
        {
        }

        public override void DoLayout()
        {
            base.DoLayout();
            Height = 20 * Scale;
        }

        public override void Paint(float cx, float cy, ICanvas canvas)
        {
            var res = Renderer.Resources;

            canvas.Font = res.MarkerFont;

            var textw = canvas.MeasureText("tr");
            canvas.FillText("tr", cx + X, cy + Y + canvas.Font.Size / 2);

            var startX = textw + 3 * Scale;
            var endX = Width - startX;
            var waveScale = 1.2f;
            var step = 11 * Scale * waveScale;
            var loops = Math.Max(1, (endX - startX) / step);


            var loopX = startX;
            var loopY = cy + Y + Height;
            for (var i = 0; i < loops; i++)
            {
                canvas.FillMusicFontSymbol(cx + X + loopX, loopY, waveScale, MusicFontSymbol.WaveHorizontalSlight);
                loopX += step;
            }
        }
    }
}
