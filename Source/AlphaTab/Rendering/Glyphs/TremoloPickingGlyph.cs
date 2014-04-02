using AlphaTab.Model;

namespace AlphaTab.Rendering.Glyphs
{
    public class TremoloPickingGlyph : SvgGlyph
    {
        public TremoloPickingGlyph(int x, int y, Duration duration)
            : base(x, y, GetSvg(duration), 1, 1)
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

        private static LazySvg GetSvg(Duration duration)
        {
            switch (duration)
            {
                case Duration.ThirtySecond:
                    return MusicFont.TremoloPickingThirtySecond;
                case Duration.Sixteenth:
                    return MusicFont.TremoloPickingSixteenth;
                case Duration.Eighth:
                    return MusicFont.TremoloPickingEighth;
                default:
                    return null;
            }
        }
    }
}
