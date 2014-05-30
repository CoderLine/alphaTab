using AlphaTab.Platform;

namespace AlphaTab.Rendering.Glyphs
{
    public class RepeatOpenGlyph : Glyph
    {
        private readonly int _dotOffset;
        private readonly float _circleSize;

        public RepeatOpenGlyph(int x, int y, float circleSize, int dotOffset)
            : base(x, y)
        {
            _dotOffset = dotOffset;
            _circleSize = circleSize;
        }

        public override void DoLayout()
        {
            Width = (int)(13 * Scale);
        }

        public override bool CanScale
        {
            get { return false; }
        }

        public override void Paint(int cx, int cy, ICanvas canvas)
        {
            var res = Renderer.Resources;

            var blockWidth = 4 * Scale;

            var top = cy + Y + Renderer.TopPadding;
            var bottom = cy + Y + Renderer.Height - Renderer.BottomPadding;
            float left = cx + X + 0.5f;
            // big bar
            var h = bottom - top;
            canvas.FillRect(left, top, blockWidth, h);

            // line
            left += (blockWidth * 2) - 0.5f;
            canvas.BeginPath();
            canvas.MoveTo(left, top);
            canvas.LineTo(left, bottom);
            canvas.Stroke();

            //circles 
            left += 3 * Scale;

            var circleSize = _circleSize * Scale;
            var middle = (top + bottom) / 2;
            canvas.FillCircle(left, middle - (circleSize * _dotOffset), circleSize);
            canvas.FillCircle(left, middle + (circleSize * _dotOffset), circleSize);
        }
    }
}
