using AlphaTab.Platform;

namespace AlphaTab.Rendering.Glyphs
{
    public class RepeatCloseGlyph : Glyph
    {
        public RepeatCloseGlyph(int x = 0, int y = 0)
            : base(x, y)
        {
        }

        public override void DoLayout()
        {
            Width = (int)((Renderer.IsLast ? 11 : 13) * Scale);
        }

        public override bool CanScale
        {
            get { return false; }
        }

        public override void Paint(int cx, int cy, ICanvas canvas)
        {
            var res = Renderer.Resources;
            canvas.Color = res.MainGlyphColor;

            var blockWidth = 4*Scale;

            var top = cy + Y + Renderer.TopPadding;
            var bottom = cy + Y + Renderer.Height - Renderer.BottomPadding;
            float left = cx + X;
            var h = bottom - top;

            //circles 
            var circleSize = 1.5f*Scale;
            var middle = (top + bottom) / 2;
            const int dotOffset = 3;
            canvas.BeginPath();
            canvas.Circle(left, middle - (circleSize * dotOffset), circleSize);
            canvas.Circle(left, middle + (circleSize * dotOffset), circleSize);
            canvas.Fill();
        
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
