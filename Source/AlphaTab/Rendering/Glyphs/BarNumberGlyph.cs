using AlphaTab.Platform;

namespace AlphaTab.Rendering.Glyphs
{
    public class BarNumberGlyph : Glyph
    {
        private readonly int _number;
        private readonly bool _hidden;

        public BarNumberGlyph(int x, int y, int number, bool hidden)
            : base(x, y)
        {
            _number = number;
            _hidden = hidden;
        }

        public override void DoLayout()
        {
            var scoreRenderer = Renderer.Layout.Renderer;
            scoreRenderer.Canvas.Font = scoreRenderer.RenderingResources.BarNumberFont;
            Width = (int)(10 * Scale);
        }

        public override bool CanScale
        {
            get { return false; }
        }

        public override void Paint(int cx, int cy, ICanvas canvas)
        {
            if (_hidden)
            {
                return;
            }
            var res = Renderer.Resources;
            canvas.Color = res.BarNumberColor;
            canvas.Font = res.BarNumberFont;

            canvas.FillText(_number.ToString(), cx + X, cy + Y);

            canvas.Color = res.MainGlyphColor;
        }
    }
}
