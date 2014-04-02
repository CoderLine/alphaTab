using AlphaTab.Model;
using AlphaTab.Rendering.Glyphs;

namespace AlphaTab.Rendering.Effects
{
    public class ChordsEffectInfo : IEffectBarRendererInfo
    {
        public bool HideOnMultiTrack { get { return false; } }
        public bool ShouldCreateGlyph(EffectBarRenderer renderer, Beat beat)
        {
            return beat.HasChord;
        }

        public EffectBarGlyphSizing SizingMode { get { return EffectBarGlyphSizing.SingleOnBeatOnly; } }
        public int GetHeight(EffectBarRenderer renderer)
        {
            return (int)(20 * renderer.Scale);
        }

        public Glyph CreateNewGlyph(EffectBarRenderer renderer, Beat beat)
        {
            return new TextGlyph(0, 0, beat.Chord.Name, renderer.Resources.EffectFont);
        }

        public bool CanExpand(EffectBarRenderer renderer, Beat @from, Beat to)
        {
            return true;
        }
    }
}