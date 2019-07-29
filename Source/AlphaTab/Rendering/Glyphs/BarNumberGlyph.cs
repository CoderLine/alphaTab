using AlphaTab.Platform;

namespace AlphaTab.Rendering.Glyphs
{
    internal class BarNumberGlyph : Glyph
    {
        private readonly int _number;

        public BarNumberGlyph(float x, float y, int number)
            : base(x, y)
        {
            _number = number;
        }

        public override void DoLayout()
        {
            Renderer.ScoreRenderer.Canvas.Font = Renderer.Resources.BarNumberFont;
            Width = Renderer.ScoreRenderer.Canvas.MeasureText(_number.ToString()) + 5 * Scale;
        }

        public override void Paint(float cx, float cy, ICanvas canvas)
        {
            if (!Renderer.Staff.IsFirstInAccolade)
            {
                return;
            }

            var res = Renderer.Resources;
            var c = canvas.Color;
            canvas.Color = res.BarNumberColor;
            canvas.Font = res.BarNumberFont;

            canvas.FillText(_number.ToString(), cx + X, cy + Y);
            canvas.Color = c;
        }
    }
}
