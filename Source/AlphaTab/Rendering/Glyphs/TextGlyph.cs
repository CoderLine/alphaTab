using AlphaTab.Platform;
using AlphaTab.Platform.Model;

namespace AlphaTab.Rendering.Glyphs
{
    class TextGlyph : EffectGlyph
    {
        private readonly string[] _lines;

        public Font Font { get; set; }
        public TextAlign TextAlign { get; set; }

        public TextGlyph(float x, float y, string text, Font font, TextAlign textAlign = TextAlign.Left)
            : base(x, y)
        {
            _lines = text.Split('\n');
            Font = font;
            TextAlign = textAlign;
        }
        
        public override void DoLayout()
        {
            base.DoLayout();
            Height = Font.Size * _lines.Length;
        }

        public override void Paint(float cx, float cy, ICanvas canvas)
        {
            canvas.Font = Font;
            var old = canvas.TextAlign;
            var y = cy + Y;
            foreach (var line in _lines)
            {
                canvas.TextAlign = TextAlign;
                canvas.FillText(line, cx + X, y);
                canvas.TextAlign = old;
                y += Font.Size;
            }
        }
    }
}
