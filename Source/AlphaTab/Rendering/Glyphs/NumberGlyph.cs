namespace AlphaTab.Rendering.Glyphs
{
    public class NumberGlyph : GlyphGroup
    {
        private readonly int _number;

        public NumberGlyph(int x, int y, int number)
            : base(x, y, null)
        {
            _number = number;
        }

        public override bool CanScale
        {
            get { return false; }
        }

        public override void DoLayout()
        {
            var i = _number;
            while (i > 0)
            {
                var num = i % 10;
                var gl = new DigitGlyph(0, 0, num);
                Glyphs.Add(gl);
                i = i / 10;
            }
            Glyphs.Reverse();

            var cx = 0;
            for (int j = 0; j < Glyphs.Count; j++)
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
