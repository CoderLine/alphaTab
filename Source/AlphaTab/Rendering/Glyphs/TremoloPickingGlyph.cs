using AlphaTab.Model;

namespace AlphaTab.Rendering.Glyphs
{
    public class TremoloPickingGlyph : MusicFontGlyph
    {
        public TremoloPickingGlyph(int x, int y, Duration duration)
            : base(x, y, 1, GetSymbol(duration))
        {
        }

        public override void DoLayout()
        {
            Width = (int)(12 * Scale);
        }

        public override bool CanScale
        {
            get { return false; }
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
