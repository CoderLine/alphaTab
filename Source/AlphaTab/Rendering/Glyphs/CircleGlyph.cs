using AlphaTab.Platform;

namespace AlphaTab.Rendering.Glyphs
{
    class CircleGlyph : Glyph
    {
        private readonly float _size;

        public CircleGlyph(float x, float y, float size)
            : base(x, y)
        {
            _size = size;
        }

        public override void DoLayout()
        {
            Width = _size + (3 * Scale);
        }

        public override void Paint(float cx, float cy, ICanvas canvas)
        {
            canvas.FillCircle(cx + X, cy + Y, _size);
        }
    }
}
