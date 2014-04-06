using System;
using AlphaTab.Model;

namespace AlphaTab.Rendering.Glyphs
{
    public class ClefGlyph : SvgGlyph
    {
        public ClefGlyph(int x, int y, Clef clef)
            : base(x, y, GetClefSvg(clef), 1, 1)
        {
        }

        public override void DoLayout()
        {
            Width = (int)(28 * Scale);
        }

        public override bool CanScale
        {
            get { return false; }
        }

        private static LazySvg GetClefSvg(Clef clef)
        {
            switch (clef)
            {
                case Clef.Neutral:
                    return MusicFont.ClefNeutral;
                case Clef.C3:
                    return MusicFont.ClefC;
                case Clef.C4:
                    return MusicFont.ClefC;
                case Clef.F4:
                    return MusicFont.ClefF;
                case Clef.G2:
                    return MusicFont.ClefG;
                default:
                    throw new ArgumentOutOfRangeException("clef");
            }
        }
    }
}
