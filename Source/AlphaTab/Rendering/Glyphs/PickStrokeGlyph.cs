using AlphaTab.Model;
using AlphaTab.Platform;

namespace AlphaTab.Rendering.Glyphs
{
    internal class PickStrokeGlyph : MusicFontGlyph
    {
        public PickStrokeGlyph(float x, float y, PickStroke pickStroke)
            : base(x, y, 0.75f, GetSymbol(pickStroke))
        {
        }

        public override void DoLayout()
        {
            Width = 9 * Scale;
            Height = 10 * Scale;
        }

        public override void Paint(float cx, float cy, ICanvas canvas)
        {
            base.Paint(cx, cy + Height, canvas);
        }

        private static MusicFontSymbol GetSymbol(PickStroke pickStroke)
        {
            switch (pickStroke)
            {
                case PickStroke.Up: return MusicFontSymbol.PickStrokeUp;
                case PickStroke.Down: return MusicFontSymbol.PickStrokeDown;
                default: return MusicFontSymbol.None;
            }
        }
    }
}
