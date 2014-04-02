using AlphaTab.Model;
using AlphaTab.Rendering.Glyphs;

namespace AlphaTab.Rendering.Effects
{
    public class CrescendoEffectInfo : IEffectBarRendererInfo
    {
        public bool HideOnMultiTrack { get { return false; } }
        public bool ShouldCreateGlyph(EffectBarRenderer renderer, Beat beat)
        {
            return beat.Crescendo != CrescendoType.None;
        }

        public EffectBarGlyphSizing SizingMode { get { return EffectBarGlyphSizing.GroupedPreBeatToPostBeat; } }
        public int GetHeight(EffectBarRenderer renderer)
        {
            return (int)(CrescendoGlyph.Height * renderer.Scale);
        }

        public Glyph CreateNewGlyph(EffectBarRenderer renderer, Beat beat)
        {
            return new CrescendoGlyph(0, 0, beat.Crescendo);
        }

        public bool CanExpand(EffectBarRenderer renderer, Beat @from, Beat to)
        {
            return from.Crescendo == to.Crescendo;
        }
    }
}