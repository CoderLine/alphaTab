using AlphaTab.Model;

namespace AlphaTab.Rendering.Glyphs
{
    internal class TremoloPickingGlyph : MusicFontGlyph
    {
        public TremoloPickingGlyph(float x, float y, Duration duration)
            : base(x, y, 1, GetSymbol(duration))
        {
        }

        public override void DoLayout()
        {
            Width = 12 * Scale;
        }

        private static MusicFontSymbol GetSymbol(Duration duration)
        {
            switch (duration)
            {
                case Duration.ThirtySecond:
                    return MusicFontSymbol.TremoloPickingThirtySecond;
                case Duration.Sixteenth:
                    return MusicFontSymbol.TremoloPickingSixteenth;
                case Duration.Eighth:
                    return MusicFontSymbol.TremoloPickingEighth;
                default:
                    return MusicFontSymbol.None;
            }
        }
    }
}
