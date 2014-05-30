using AlphaTab.Platform;

namespace AlphaTab.Rendering.Glyphs
{
    public class CircleGlyph : Glyph
    {
        private readonly float _size;

        public CircleGlyph(int x, int y, float size)
            : base(x, y)
        {
            _size = size;
        }

        public override void DoLayout()
        {
            Width = (int)(_size + (3 * Scale));
        }

        public override bool CanScale
        {
            get { return false; }
        }

        public override void Paint(int cx, int cy, ICanvas canvas)
        {
            canvas.FillCircle(cx + X, cy + Y, _size);
        }
    }
}
