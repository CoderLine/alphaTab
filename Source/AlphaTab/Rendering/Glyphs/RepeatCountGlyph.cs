using AlphaTab.Platform;
using AlphaTab.Platform.Model;

namespace AlphaTab.Rendering.Glyphs
{ 
    class RepeatCountGlyph : Glyph
    {
        private readonly int _count;

        public RepeatCountGlyph(float x, float y, int count)
            : base(x, y)
        {
            _count = count;
        }

        public override void DoLayout()
        {
            Width = 0;
        }

        public override void Paint(float cx, float cy, ICanvas canvas)
        {
            var res = Renderer.Resources;
            var oldAlign = canvas.TextAlign;
            canvas.Font = res.BarNumberFont;
            canvas.TextAlign = TextAlign.Right;
            var s = "x" + _count;
            var w = canvas.MeasureText(s)/1.5f;
            
            canvas.FillText(s, cx + X - w, cy + Y);
            canvas.TextAlign = oldAlign;
        }
    }
}