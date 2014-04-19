using AlphaTab.Platform;

namespace AlphaTab.Rendering.Glyphs
{ 
    public class RepeatCountGlyph : Glyph
    {
        private readonly int _count;

        public RepeatCountGlyph(int x, int y, int count) : base(x, y)
        {
            _count = count;
        }

        public override void DoLayout()
        {
            Width = 0;
        }

        public override bool CanScale
        {
            get { return false; }
        }

        public override void Paint(int cx, int cy, ICanvas canvas)
        {
            var res = Renderer.Resources;
            canvas.Font = res.BarNumberFont;

            var s = "x" + _count;
            var w = (int) (canvas.MeasureText(s)/1.5);
            canvas.FillText(s, cx + X - w, cy + Y);
        }
    }
}