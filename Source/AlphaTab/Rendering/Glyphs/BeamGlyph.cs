using AlphaTab.Model;
using AlphaTab.Rendering.Utils;

namespace AlphaTab.Rendering.Glyphs
{
    public class BeamGlyph : MusicFontGlyph
    {
        public BeamGlyph(int x, int y, Duration duration, BeamDirection direction, bool isGrace)
            : base(x, y, isGrace ? NoteHeadGlyph.GraceScale : 1, GetSymbol(duration, direction, isGrace))
        {
        }


        public override void DoLayout()
        {
            Width = 0;
        }

        private static MusicFontSymbol GetSymbol(Duration duration, BeamDirection direction, bool isGrace)
        {
            if (direction == BeamDirection.Up)
            {
                if (isGrace)
                {
                    return MusicFontSymbol.FooterUpEighth;
                }
                switch (duration)
                {
                    case Duration.Eighth: return MusicFontSymbol.FooterUpEighth;
                    case Duration.Sixteenth: return MusicFontSymbol.FooterUpSixteenth;
                    case Duration.ThirtySecond: return MusicFontSymbol.FooterUpThirtySecond;
                    case Duration.SixtyFourth: return MusicFontSymbol.FooterUpSixtyFourth;
                    default: return MusicFontSymbol.FooterUpEighth;
                }
            }
            else
            {
                if (isGrace)
                {
                    return MusicFontSymbol.FooterDownEighth;
                }
                switch (duration)
                {
                    case Duration.Eighth: return MusicFontSymbol.FooterDownEighth;
                    case Duration.Sixteenth: return MusicFontSymbol.FooterDownSixteenth;
                    case Duration.ThirtySecond: return MusicFontSymbol.FooterDownThirtySecond;
                    case Duration.SixtyFourth: return MusicFontSymbol.FooterDownSixtyFourth;
                    default: return MusicFontSymbol.FooterDownEighth;
                }
            }

        }

    }
}
