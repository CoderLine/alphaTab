using AlphaTab.Model;

namespace AlphaTab.Rendering.Glyphs
{
    class AccentuationGlyph : MusicFontGlyph
    {
        public AccentuationGlyph(float x, float y, AccentuationType accentuation)
            : base(x, y, 1, GetSymbol(accentuation))
        {
        }

        private static MusicFontSymbol GetSymbol(AccentuationType accentuation)
        {
            switch (accentuation)
            {
                case AccentuationType.None:
                    return MusicFontSymbol.None;
                case AccentuationType.Normal:
                    return MusicFontSymbol.Accentuation;
                case AccentuationType.Heavy:
                    return MusicFontSymbol.HeavyAccentuation;
                default:
                    return MusicFontSymbol.None;
            }
        }

        public override void DoLayout()
        {
            Width = 9 * Scale;
        }
    }
}
