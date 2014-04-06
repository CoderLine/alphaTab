using AlphaTab.Platform;

namespace AlphaTab.Rendering.Glyphs
{
    public class BarSeperatorGlyph : Glyph
    {
        private readonly bool _isLast;

        public BarSeperatorGlyph(int x, int y, bool isLast = false)
            : base(x, y)
        {
            _isLast = isLast;
        }

        public override void DoLayout()
        {
            Width = (int)((_isLast ? 8 : 1) * Scale);
        }

        public override bool CanScale
        {
            get { return false; }
        }

        public override void Paint(int cx, int cy, ICanvas canvas)
        {
            var res = Renderer.Resources;
            canvas.Color = res.BarSeperatorColor;

            var blockWidth = 4 * Scale;

            var top = cy + Y + Renderer.TopPadding;
            var bottom = cy + Y + Renderer.Height - Renderer.BottomPadding;
            float left = cx + X;
            var h = bottom - top;

            // line
            canvas.BeginPath();
            canvas.MoveTo(left, top);
            canvas.LineTo(left, bottom);
            canvas.Stroke();

            if (_isLast)
            {
                // big bar
                left += (3 * Scale) + 0.5f;
                canvas.FillRect(left, top, blockWidth, h);
            }
        }
    }
}
