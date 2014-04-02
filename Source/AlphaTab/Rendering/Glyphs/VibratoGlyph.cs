using System;
using AlphaTab.Platform;

namespace AlphaTab.Rendering.Glyphs
{
    public class VibratoGlyph : Glyph
    {
        private readonly float _scale;

        public VibratoGlyph(int x, int y, float scale = 0.9f)
            : base(x, y)
        {
            _scale = scale;
        }

        public override void Paint(int cx, int cy, ICanvas canvas)
        {
            float step = 11 * Scale * _scale;
            int loops = (int)Math.Max(1, (Width / step));

            var loopX = 0;
            for (var i = 0; i < loops; i++)
            {
                var glyph = new SvgGlyph(loopX, 0, MusicFont.WaveHorizontal, _scale, _scale);
                glyph.Renderer = Renderer;
                glyph.Paint(cx + X, cy + Y, canvas);
                loopX += (int)step;
            }
        }
    }
}
