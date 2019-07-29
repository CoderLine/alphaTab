using AlphaTab.Model;

namespace AlphaTab.Rendering.Glyphs
{
    internal class DynamicsGlyph : MusicFontGlyph
    {
        public DynamicsGlyph(float x, float y, DynamicValue dynamics)
            : base(x, y, 0.6f, GetSymbol(dynamics))
        {
        }

        public override void DoLayout()
        {
            base.DoLayout();
            Height = 17 * Scale;
            Y += Height / 2;
        }

        private static MusicFontSymbol GetSymbol(DynamicValue dynamics)
        {
            switch (dynamics)
            {
                case DynamicValue.PPP:
                    return MusicFontSymbol.DynamicPPP;
                case DynamicValue.PP:
                    return MusicFontSymbol.DynamicPP;
                case DynamicValue.P:
                    return MusicFontSymbol.DynamicP;
                case DynamicValue.MP:
                    return MusicFontSymbol.DynamicMP;
                case DynamicValue.MF:
                    return MusicFontSymbol.DynamicMF;
                case DynamicValue.F:
                    return MusicFontSymbol.DynamicF;
                case DynamicValue.FF:
                    return MusicFontSymbol.DynamicFF;
                case DynamicValue.FFF:
                    return MusicFontSymbol.DynamicFFF;
                default:
                    return MusicFontSymbol.None;
            }
        }
    }
}
