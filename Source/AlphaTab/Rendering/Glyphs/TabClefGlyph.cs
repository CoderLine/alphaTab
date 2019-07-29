using AlphaTab.Platform;

namespace AlphaTab.Rendering.Glyphs
{
    internal class TabClefGlyph : Glyph
    {
        public TabClefGlyph(float x, float y)
            : base(x, y)
        {
        }

        public override void DoLayout()
        {
            Width = 28 * Scale;
        }

        public override void Paint(float cx, float cy, ICanvas canvas)
        {
            var strings = Renderer.Bar.Staff.Tuning.Length;

            var correction = strings * Scale * 0.5f;
            var symbol = strings <= 4 ? MusicFontSymbol.ClefTabSmall : MusicFontSymbol.ClefTab;
            var scale = strings <= 4 ? strings / 4.5f : strings / 6.5f;
            canvas.FillMusicFontSymbol(cx + X + 5 * Scale, cy + Y - correction, scale * Scale, symbol);
        }
    }
}
