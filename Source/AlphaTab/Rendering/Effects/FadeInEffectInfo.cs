using AlphaTab.Model;
using AlphaTab.Rendering.Glyphs;

namespace AlphaTab.Rendering.Effects
{
    internal class FadeInEffectInfo : IEffectBarRendererInfo
    {
        public string EffectId => "fade-in";
        public bool HideOnMultiTrack => false;
        public bool CanShareBand => true;
        public EffectBarGlyphSizing SizingMode => EffectBarGlyphSizing.SingleOnBeat;

        public bool ShouldCreateGlyph(Settings settings, Beat beat)
        {
            return beat.FadeIn;
        }

        public EffectGlyph CreateNewGlyph(BarRendererBase renderer, Beat beat)
        {
            return new FadeInGlyph(0, 0);
        }

        public bool CanExpand(Beat from, Beat to)
        {
            return true;
        }
    }
}
