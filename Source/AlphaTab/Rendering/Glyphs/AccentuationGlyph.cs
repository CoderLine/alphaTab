using System;
using AlphaTab.Model;

namespace AlphaTab.Rendering.Glyphs
{
    public class AccentuationGlyph : SvgGlyph
    {
        public AccentuationGlyph(int x, int y, AccentuationType accentuation)
            : base(x, y, GetSvg(accentuation), 1, 1)
        {
        }

        private static LazySvg GetSvg(AccentuationType accentuation)
        {
            switch (accentuation)
            {
                case AccentuationType.None:
                    return null;
                case AccentuationType.Normal:
                    return MusicFont.Accentuation;
                case AccentuationType.Heavy:
                    return MusicFont.HeavyAccentuation;
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
