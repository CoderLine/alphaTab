using AlphaTab.Model;
using AlphaTab.Rendering.Glyphs;

namespace AlphaTab.Rendering.Effects
{
    class FermataEffectInfo : IEffectBarRendererInfo
    {
        public string EffectId { get { return "fermata"; } }
        public bool HideOnMultiTrack { get { return false; } }
        public bool CanShareBand { get { return false; } }
        public EffectBarGlyphSizing SizingMode { get { return EffectBarGlyphSizing.SingleOnBeat; } }

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