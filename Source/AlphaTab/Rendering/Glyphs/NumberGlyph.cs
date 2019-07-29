namespace AlphaTab.Rendering.Glyphs
{
    internal class NumberGlyph : GlyphGroup
    {
        private readonly int _number;
        private readonly float _scale;

        public NumberGlyph(float x, float y, int number, float scale = 1.0f)
            : base(x, y)
        {
            _number = number;
            _scale = scale;
        }

        public override void DoLayout()
        {
            var i = _number;
            while (i > 0)
            {
                var num = i % 10;
                var gl = new DigitGlyph(0, 0, num, _scale);
                AddGlyph(gl);
                i = i / 10;
            }

            Glyphs.Reverse();

            var cx = 0f;
            for (int j = 0, k = Glyphs.Count; j < k; j++)
            {
                var g = Glyphs[j];
                g.X = cx;
                g.Y = 0;
                g.Renderer = Renderer;
                g.DoLayout();
                cx += g.Width;
            }

            Width = cx;
        }
    }
}
