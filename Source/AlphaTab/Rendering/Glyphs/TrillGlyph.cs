using System;
using AlphaTab.Platform;
using AlphaTab.Rendering.Utils;

namespace AlphaTab.Rendering.Glyphs
{
    public class TrillGlyph : EffectGlyph
    {
        private readonly float _scale;

        public TrillGlyph(int x, int y, float scale = 0.9f)
            : base(x, y)
        {
            _scale = scale;
        }

        public override void Paint(int cx, int cy, ICanvas canvas)
        {
            var res = Renderer.Resources;

            canvas.Font = res.MarkerFont;

            var textw = canvas.MeasureText("tr");
            canvas.FillText("tr", cx + X, cy + Y);

            var startX = textw;
            var endX = Width - startX;
            float step = 11 * Scale * _scale;
            int loops = (int)Math.Max(1, ((endX - startX) / step));

            var loopX = (int)startX;
            for (var i = 0; i < loops; i++)
            {
                canvas.FillMusicFontSymbol(cx + X + loopX, cy + Y, _scale, MusicFontSymbol.WaveHorizontal);
                loopX += (int)step;
            }
        }
    }
}
