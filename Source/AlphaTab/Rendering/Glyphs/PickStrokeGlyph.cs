using AlphaTab.Model;

namespace AlphaTab.Rendering.Glyphs
{
    public class PickStrokeGlyph : SvgGlyph
    {
        public PickStrokeGlyph(int x, int y, PickStrokeType pickStroke)
            : base(x, y, GetNoteSvg(pickStroke), 1, 1)
        {
        }

        public override void DoLayout()
        {
            Width = (int)(9 * Scale);
        }

        public override bool CanScale
        {
            get { return false; }
        }

        private static LazySvg GetNoteSvg(PickStrokeType pickStroke)
        {
            switch (pickStroke)
            {
                case PickStrokeType.Up: return MusicFont.PickStrokeUp;
                case PickStrokeType.Down: return MusicFont.PickStrokeDown;
                default: return null;
            }
        }
    }
}
