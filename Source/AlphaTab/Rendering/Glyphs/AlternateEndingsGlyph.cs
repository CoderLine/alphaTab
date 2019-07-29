using AlphaTab.Collections;
using AlphaTab.Model;
using AlphaTab.Platform;
using AlphaTab.Platform.Model;

namespace AlphaTab.Rendering.Glyphs
{
    internal class AlternateEndingsGlyph : EffectGlyph
    {
        private const float Padding = 3;

        private readonly FastList<int> _endings;
        private string _endingsString;

        public AlternateEndingsGlyph(float x, float y, byte alternateEndings)
            : base(x, y)
        {
            _endings = new FastList<int>();
            for (var i = 0; i < MasterBar.MaxAlternateEndings; i++)
            {
                if ((alternateEndings & (0x01 << i)) != 0)
                {
                    _endings.Add(i);
                }
            }
        }

        public override void DoLayout()
        {
            base.DoLayout();
            Height = Renderer.Resources.WordsFont.Size + (Padding * Scale + 2);
            var endingsStrings = new StringBuilder();
            for (int i = 0, j = _endings.Count; i < j; i++)
            {
                endingsStrings.Append(_endings[i] + 1);
                endingsStrings.Append(". ");
            }

            _endingsString = endingsStrings.ToString();
        }

        public override void Paint(float cx, float cy, ICanvas canvas)
        {
            base.Paint(cx, cy, canvas);

            var baseline = canvas.TextBaseline;
            canvas.TextBaseline = TextBaseline.Top;

            if (_endings.Count > 0)
            {
                var res = Renderer.Resources;
                canvas.Font = res.WordsFont;
                canvas.MoveTo(cx + X, cy + Y + Height);
                canvas.LineTo(cx + X, cy + Y);
                canvas.LineTo(cx + X + Width, cy + Y);
                canvas.Stroke();

                canvas.FillText(_endingsString, cx + X + Padding * Scale, cy + Y * Scale);
            }

            canvas.TextBaseline = baseline;
        }
    }
}
