using AlphaTab.Model;
using AlphaTab.Rendering.Glyphs;

namespace AlphaTab.Rendering.Effects
{
    internal class FermataEffectInfo : IEffectBarRendererInfo
    {
        public string EffectId => "fermata";
        public bool HideOnMultiTrack => false;
        public bool CanShareBand => false;
        public EffectBarGlyphSizing SizingMode => EffectBarGlyphSizing.SingleOnBeat;

        public bool ShouldCreateGlyph(Settings settings, Beat beat)
        {
            return beat.Fermata != null;
        }

        public EffectGlyph CreateNewGlyph(BarRendererBase renderer, Beat beat)
        {
            return new FermataGlyph(0, 0, beat.Fermata.Type);
        }

        public bool CanExpand(Beat from, Beat to)
        {
            return true;
        }
    }
}
