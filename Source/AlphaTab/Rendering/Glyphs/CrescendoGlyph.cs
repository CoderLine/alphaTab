using AlphaTab.Model;
using AlphaTab.Platform;

namespace AlphaTab.Rendering.Glyphs
{
    public class CrescendoGlyph : Glyph
    {
        public const int Height = 17;

        private readonly CrescendoType _crescendo;

        public CrescendoGlyph(int x, int y, CrescendoType crescendo)
            : base(x, y)
        {
            _crescendo = crescendo;
        }

        public override void Paint(int cx, int cy, ICanvas canvas)
        {
            var height = Height * Scale;
            var res = Renderer.Resources;
            canvas.Color = res.MainGlyphColor;
            canvas.BeginPath();
            if (_crescendo == CrescendoType.Crescendo)
            {
                canvas.MoveTo(cx + X + Width, cy + Y);
                canvas.LineTo(cx + X, cy + Y + (height / 2));
                canvas.LineTo(cx + X + Width, cy + Y + height);
            }
            else
            {
                canvas.MoveTo(cx + X, cy + Y);
                canvas.LineTo(cx + X + Width, cy + Y + (height / 2));
                canvas.LineTo(cx + X, cy + Y + height);
            }
            canvas.Stroke();
        }
    }
}
