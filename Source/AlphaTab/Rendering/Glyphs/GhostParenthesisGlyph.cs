using AlphaTab.Platform;

namespace AlphaTab.Rendering.Glyphs
{
    class GhostParenthesisGlyph : Glyph
    {
        private readonly bool _isOpen;
        private const int Size = 6;
        public GhostParenthesisGlyph(bool isOpen) : base(0, 0)
        {
            _isOpen = isOpen;
        }

        public float Height { get; set; }

        public override void DoLayout()
        {
            base.DoLayout();
            Width = Size * Scale;
        }

        public override void Paint(float cx, float cy, ICanvas canvas)
        {
            if (_isOpen)
            {
                TieGlyph.PaintTie(canvas, Scale,
                    cx + X + Width, cy + Y + Height,
                    cx + X + Width, cy + Y,
                    false, Size, 3);
            }
            else
            {
                TieGlyph.PaintTie(canvas, Scale,
                    cx + X, cy + Y,
                    cx + X, cy + Y + Height,
                    false, Size, 3);

            }
            canvas.Fill();
        }
    }
}