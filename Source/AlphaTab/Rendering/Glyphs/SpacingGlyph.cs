namespace AlphaTab.Rendering.Glyphs
{
    /// <summary>
    /// This simple glyph allows to put an empty region in to a BarRenderer.
    /// </summary>
    internal class SpacingGlyph : Glyph
    {
        public SpacingGlyph(float x, float y, float width)
            : base(x, y)
        {
            Width = width;
        }
    }
}
