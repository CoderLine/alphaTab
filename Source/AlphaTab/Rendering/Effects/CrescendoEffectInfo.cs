using AlphaTab.Model;
using AlphaTab.Rendering.Glyphs;

namespace AlphaTab.Rendering.Effects
{
    internal class CrescendoEffectInfo : IEffectBarRendererInfo
    {
        public string EffectId => "crescendo";
        public bool HideOnMultiTrack => false;
        public bool CanShareBand => true;
        public EffectBarGlyphSizing SizingMode => EffectBarGlyphSizing.GroupedOnBeatToEnd;

        public bool ShouldCreateGlyph(Settings settings, Beat beat)
        {
            return beat.Crescendo != CrescendoType.None;
        }


        public EffectGlyph CreateNewGlyph(BarRendererBase renderer, Beat beat)
        {
            return new CrescendoGlyph(0, 0, beat.Crescendo);
        }

        public bool CanExpand(Beat from, Beat to)
        {
            return from.Crescendo == to.Crescendo;
        }
    }
}
