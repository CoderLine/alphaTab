using AlphaTab.Platform;

namespace AlphaTab.Rendering.Glyphs
{
    class RepeatCloseGlyph : Glyph
    {
        public RepeatCloseGlyph(float x, float y)
            : base(x, y)
        {
        }

        public override void DoLayout()
        {
            Width = 11 * Scale;
        }

        public override void Paint(float cx, float cy, ICanvas canvas)
        {
            var blockWidth = 4 * Scale;

            var top = cy + Y + Renderer.TopPadding;
            var bottom = cy + Y + Renderer.Height - Renderer.BottomPadding;
            var left = cx + X;
            var h = bottom - top;

            //circles 
            var circleSize = 1.5f * Scale;
            var middle = (top + bottom) / 2;
            const int dotOffset = 3;

            canvas.FillCircle(left, middle - (circleSize * dotOffset), circleSize);
            canvas.FillCircle(left, middle + (circleSize * dotOffset), circleSize);

            // line
            left += (4 * Scale);
            canvas.BeginPath();
            canvas.MoveTo(left, top);
            canvas.LineTo(left, bottom);
            canvas.Stroke();

            // big bar
            left += (3 * Scale) + 0.5f;
            canvas.FillRect(left, top, blockWidth, h);
        }
    }
}
