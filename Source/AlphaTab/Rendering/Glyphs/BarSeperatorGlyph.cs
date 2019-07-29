using AlphaTab.Platform;

namespace AlphaTab.Rendering.Glyphs
{
    internal class BarSeperatorGlyph : Glyph
    {
        public BarSeperatorGlyph(float x, float y)
            : base(x, y)
        {
        }

        public override void DoLayout()
        {
            if (Renderer.IsLast)
            {
                Width = 15 * Scale;
            }
            else if (Renderer.NextRenderer == null || Renderer.NextRenderer.Staff != Renderer.Staff ||
                     !Renderer.NextRenderer.Bar.MasterBar.IsRepeatStart)
            {
                Width = 2 * Scale;
                if (Renderer.Bar.MasterBar.IsDoubleBar)
                {
                    Width += 2 * Scale;
                }
            }
            else
            {
                Width = 2 * Scale;
            }
        }

        public override void Paint(float cx, float cy, ICanvas canvas)
        {
            var blockWidth = 4 * Scale;

            var top = cy + Y + Renderer.TopPadding;
            var bottom = cy + Y + Renderer.Height - Renderer.BottomPadding;
            var left = (int)(cx + X);
            var h = bottom - top;

            if (Renderer.IsLast)
            {
                // small bar
                canvas.FillRect(left + Width - blockWidth - blockWidth, top, Scale, h);
                // big bar
                canvas.FillRect(left + Width - blockWidth, top, blockWidth, h);
            }
            else if (Renderer.NextRenderer == null || Renderer.NextRenderer.Staff != Renderer.Staff ||
                     !Renderer.NextRenderer.Bar.MasterBar.IsRepeatStart)
            {
                // small bar
                canvas.FillRect(left + Width - Scale, top, Scale, h);
                if (Renderer.Bar.MasterBar.IsDoubleBar)
                {
                    canvas.FillRect(left + Width - 5 * Scale, top, Scale, h);
                }
            }
        }
    }
}
