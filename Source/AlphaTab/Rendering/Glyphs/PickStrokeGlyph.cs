using AlphaTab.Model;

namespace AlphaTab.Rendering.Glyphs
{
    public class PickStrokeGlyph : MusicFontGlyph
    {
        public PickStrokeGlyph(int x, int y, PickStrokeType pickStroke)
            : base(x, y, 1, GetSymbol(pickStroke))
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

        private static MusicFontSymbol GetSymbol(PickStrokeType pickStroke)
        {
            switch (pickStroke)
            {
                case PickStrokeType.Up: return MusicFontSymbol.PickStrokeUp;
                case PickStrokeType.Down: return MusicFontSymbol.PickStrokeDown;
                default: return MusicFontSymbol.None;
            }
        }
    }
}
