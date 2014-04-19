using AlphaTab.Model;
using AlphaTab.Rendering.Glyphs;

namespace AlphaTab.Rendering.Effects
{
    public class FadeInEffectInfo : IEffectBarRendererInfo
    {
        public bool HideOnMultiTrack { get { return false; } }
        public bool ShouldCreateGlyph(EffectBarRenderer renderer, Beat beat)
        {
            return beat.FadeIn;
        }

        public EffectBarGlyphSizing SizingMode { get { return EffectBarGlyphSizing.SingleOnBeatOnly; } }
        public int GetHeight(EffectBarRenderer renderer)
        {
            return (int)(20 * renderer.Scale);
        }

        public EffectGlyph CreateNewGlyph(EffectBarRenderer renderer, Beat beat)
        {
            return new FadeInGlyph(0, 0);
        }

        public bool CanExpand(EffectBarRenderer renderer, Beat @from, Beat to)
        {
            return true;
        }
    }
}