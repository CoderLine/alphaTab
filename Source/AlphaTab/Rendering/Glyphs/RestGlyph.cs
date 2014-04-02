using System;
using AlphaTab.Model;

namespace AlphaTab.Rendering.Glyphs
{
    public class RestGlyph : SvgGlyph
    {
        private readonly Duration _duration;

        public RestGlyph(int x, int y, Duration duration)
            : base(x, y, GetRestSVg(duration), 1, 1)
        {
            _duration = duration;
        }

        private static LazySvg GetRestSVg(Duration duration)
        {
            switch (duration)
            {
                case Duration.Whole:
                case Duration.Half:
                    return MusicFont.RestWhole;
                case Duration.Quarter:
                    return MusicFont.RestQuarter;
                case Duration.Eighth:
                    return MusicFont.RestEighth;
                case Duration.Sixteenth:
                    return MusicFont.RestSixteenth;
                case Duration.ThirtySecond:
                    return MusicFont.RestThirtySecond;
                case Duration.SixtyFourth:
                    return MusicFont.RestSixtyFourth;
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
