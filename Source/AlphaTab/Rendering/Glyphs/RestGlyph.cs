using System;
using AlphaTab.Model;

namespace AlphaTab.Rendering.Glyphs
{
    public class RestGlyph : MusicFontGlyph
    {
        private readonly Duration _duration;

        public RestGlyph(int x, int y, Duration duration)
            : base(x, y, 1, GetSymbol(duration))
        {
            _duration = duration;
        }

        private static MusicFontSymbol GetSymbol(Duration duration)
        {
            switch (duration)
            {
                case Duration.Whole:
                case Duration.Half:
                    return MusicFontSymbol.RestWhole;
                case Duration.Quarter:
                    return MusicFontSymbol.RestQuarter;
                case Duration.Eighth:
                    return MusicFontSymbol.RestEighth;
                case Duration.Sixteenth:
                    return MusicFontSymbol.RestSixteenth;
                case Duration.ThirtySecond:
                    return MusicFontSymbol.RestThirtySecond;
                case Duration.SixtyFourth:
                    return MusicFontSymbol.RestSixtyFourth;
                default:
                    throw new ArgumentOutOfRangeException("duration");
            }
        }

        public override void DoLayout()
        {
            switch (_duration)
            {
                case Duration.Whole:
                case Duration.Half:
                case Duration.Quarter:
                case Duration.Eighth:
                case Duration.Sixteenth:
                    Width = (int)(9 * Scale);
                    break;
                case Duration.ThirtySecond:
                    Width = (int)(12 * Scale);
                    break;
                case Duration.SixtyFourth:
                    Width = (int)(14 * Scale);
                    break;
            }
        }

        public override bool CanScale
        {
            get { return false; }
        }
    }
}
