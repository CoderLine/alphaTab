using AlphaTab.Model;
using AlphaTab.Rendering.Utils;

namespace AlphaTab.Rendering.Glyphs
{
    public class BeamGlyph : SvgGlyph
    {
        public BeamGlyph(int x, int y, Duration duration, BeamDirection direction, bool isGrace)
            : base(x, y, GetRestSvg(duration, isGrace), isGrace ? NoteHeadGlyph.GraceScale : 1, GetSvgScale(direction, isGrace))
        {
        }

        private static float GetSvgScale(BeamDirection direction, bool isGrace)
        {
            var scale = (isGrace ? NoteHeadGlyph.GraceScale : 1);
            if (direction == BeamDirection.Up)
            {
                return 1 * scale;
            }
            return -1 * scale;
        }

        public override void DoLayout()
        {
            Width = 0;
        }

        private static LazySvg GetRestSvg(Duration duration, bool isGrace)
        {
            if (isGrace)
            {
                return MusicFont.FooterUpEighth;
            }
            switch (duration)
            {
                case Duration.Eighth: return MusicFont.FooterUpEighth;
                case Duration.Sixteenth: return MusicFont.FooterUpSixteenth;
                case Duration.ThirtySecond: return MusicFont.FooterUpThirtySecond;
                case Duration.SixtyFourth: return MusicFont.FooterUpSixtyFourth;
                default: return null;
            }
        }

    }
}
