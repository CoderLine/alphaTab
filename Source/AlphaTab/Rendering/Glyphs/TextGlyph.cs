using AlphaTab.Platform;
using AlphaTab.Platform.Model;

namespace AlphaTab.Rendering.Glyphs
{
    public class TextGlyph : Glyph
    {
        private readonly string _text;
        private readonly Font _font;

        public TextGlyph(int x, int y, string text, Font font)
            : base(x, y)
        {
            _text = text;
            _font = font;
        }

        public override void Paint(int cx, int cy, ICanvas canvas)
        {
            var res = Renderer.Resources;

            canvas.Font = _font;
            canvas.Color = res.MainGlyphColor;
            var old = canvas.TextAlign;
            canvas.TextAlign = TextAlign.Left;
            canvas.FillText(_text, cx + X, cy + Y);
            canvas.TextAlign = old;
        }
    }
}
