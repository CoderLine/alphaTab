using System;
using AlphaTab.Model;

namespace AlphaTab.Rendering.Glyphs
{
    public class AccentuationGlyph : MusicFontGlyph
    {
        public AccentuationGlyph(int x, int y, AccentuationType accentuation)
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
                    throw new ArgumentOutOfRangeException("accentuation");
            }
        }

        public override void DoLayout()
        {
            Width = (int)(9 * Scale);
        }

        public override bool CanScale
        {
            get { return false; }
        }
    }
}
