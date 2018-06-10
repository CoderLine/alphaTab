using AlphaTab.Model;
using AlphaTab.Platform;

namespace AlphaTab.Rendering.Glyphs
{
    public class FermataGlyph : MusicFontGlyph
    {
        public FermataGlyph(float x, float y, FermataType fermata)
            : base(x, y, 1, GetSymbol(fermata))
        {
        }

        private static MusicFontSymbol GetSymbol(FermataType accentuation)
        {
            switch (accentuation)
            {
                case FermataType.Short:
                    return MusicFontSymbol.FermataShort;
                case FermataType.Medium:
                    return MusicFontSymbol.FermataMedium;
                case FermataType.Long:
                    return MusicFontSymbol.FermataLong;
                default:
                    return MusicFontSymbol.None;
            }
        }

        public override void DoLayout()
        {
            Width = 23 * Scale;
            Height = 12 * Scale;
        }

        public override void Paint(float cx, float cy, ICanvas canvas)
        {
            base.Paint(cx - Width / 2, cy + Height, canvas);
        }
    }
}