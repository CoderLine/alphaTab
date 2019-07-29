using AlphaTab.Model;
using AlphaTab.Rendering.Glyphs;

namespace AlphaTab.Rendering.Effects
{
    class CrescendoEffectInfo : IEffectBarRendererInfo
    {
        public string EffectId { get { return "crescendo"; } }
        public bool HideOnMultiTrack { get { return false; } }
        public bool CanShareBand { get { return true; } }
        public EffectBarGlyphSizing SizingMode { get { return EffectBarGlyphSizing.GroupedOnBeatToEnd; } }

        public bool ShouldCreateGlyph(Settings settings, Beat beat)
        {
            return beat.Crescendo != CrescendoType.None;
        }

       
        public EffectGlyph CreateNewGlyph(BarRendererBase renderer, Beat beat)
        {
            return new CrescendoGlyph(0, 0, beat.Crescendo);
        }

        public bool CanExpand(Beat @from, Beat to)
        {
            return from.Crescendo == to.Crescendo;
        }
    }
}