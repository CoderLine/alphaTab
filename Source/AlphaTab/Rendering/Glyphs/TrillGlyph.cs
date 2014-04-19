using System;
using AlphaTab.Platform;

namespace AlphaTab.Rendering.Glyphs
{
    public class TrillGlyph : Glyph
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
                var glyph = new SvgGlyph(loopX, 0, MusicFont.WaveHorizontal, _scale, _scale);
                glyph.Renderer = Renderer;
                glyph.Paint(cx + X, cy + Y + (int)(res.MarkerFont.Size / 2), canvas);
                loopX += (int)step;
            }
        }
    }
}
