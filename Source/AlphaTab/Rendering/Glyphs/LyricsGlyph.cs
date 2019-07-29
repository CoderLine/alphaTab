using AlphaTab.Platform;
using AlphaTab.Platform.Model;

namespace AlphaTab.Rendering.Glyphs
{
    internal class LyricsGlyph : EffectGlyph
    {
        private readonly string[] _lines;

        public Font Font { get; set; }
        public TextAlign TextAlign { get; set; }

        public LyricsGlyph(float x, float y, string[] lines, Font font, TextAlign textAlign = TextAlign.Center)
            : base(x, y)
        {
            _lines = lines;
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
            canvas.TextAlign = TextAlign;
            for (var i = 0; i < _lines.Length; i++)
            {
                if (_lines[i] != null)
                {
                    canvas.FillText(_lines[i], cx + X, cy + Y + i * Font.Size);
                }
            }

            canvas.TextAlign = old;
        }
    }
}
