using System;
using AlphaTab.Model;

namespace AlphaTab.Rendering.Glyphs
{
    public class ClefGlyph : MusicFontGlyph
    {
        public ClefGlyph(int x, int y, Clef clef)
            : base(x, y, 1, GetSymbol(clef))
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

        private static MusicFontSymbol GetSymbol(Clef clef)
        {
            switch (clef)
            {
                case Clef.Neutral:
                    return MusicFontSymbol.ClefNeutral;
                case Clef.C3:
                    return MusicFontSymbol.ClefC;
                case Clef.C4:
                    return MusicFontSymbol.ClefC;
                case Clef.F4:
                    return MusicFontSymbol.ClefF;
                case Clef.G2:
                    return MusicFontSymbol.ClefG;
                default:
                    throw new ArgumentOutOfRangeException("clef");
            }
        }
    }
}
