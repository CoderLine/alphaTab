using AlphaTab.Model;
using AlphaTab.Rendering.Glyphs;

namespace AlphaTab.Rendering.Effects
{
    public class TapEffectInfo : IEffectBarRendererInfo
    {
        public bool HideOnMultiTrack { get { return false; } }
        public bool ShouldCreateGlyph(EffectBarRenderer renderer, Beat beat)
        {
            return (beat.Slap || beat.Pop || beat.Tap);
        }

        public EffectBarGlyphSizing SizingMode { get { return EffectBarGlyphSizing.SingleOnBeatOnly; } }
        public int GetHeight(EffectBarRenderer renderer)
        {
            return (int)(20 * renderer.Scale);
        }

        public EffectGlyph CreateNewGlyph(EffectBarRenderer renderer, Beat beat)
        {
            var res = renderer.Resources;
            if (beat.Slap)
            {
                return new TextGlyph(0, 0, "S", res.EffectFont);
            }
            if (beat.Pop)
            {
                return new TextGlyph(0, 0, "P", res.EffectFont);
            }
            return new TextGlyph(0, 0, "T", res.EffectFont);
        }

        public bool CanExpand(EffectBarRenderer renderer, Beat @from, Beat to)
        {
            return true;
        }
    }
}