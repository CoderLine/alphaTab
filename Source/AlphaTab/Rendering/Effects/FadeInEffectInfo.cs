using AlphaTab.Model;
using AlphaTab.Rendering.Glyphs;

namespace AlphaTab.Rendering.Effects
{
    class FadeInEffectInfo : IEffectBarRendererInfo
    {
        public string EffectId { get { return "fade-in"; } }
        public bool HideOnMultiTrack { get { return false; } }
        public bool CanShareBand { get { return true; } }
        public EffectBarGlyphSizing SizingMode { get { return EffectBarGlyphSizing.SingleOnBeat; } }

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