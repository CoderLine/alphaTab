namespace AlphaTab.Rendering.Glyphs
{
    /// <summary>
    /// This simple glyph allows to put an empty region in to a BarRenderer.
    /// </summary>
    public class SpacingGlyph : Glyph
    {
        private readonly bool _scaling;

        public SpacingGlyph(int x, int y, int width, bool scaling = true)
            : base(x, y)
        {
            _scaling = scaling;
            Width = width;
            _scaling = scaling;
        }

        public override bool CanScale
        {
            get { return _scaling; }
        }
    }
}
