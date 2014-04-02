using AlphaTab.Model;
using AlphaTab.Rendering.Glyphs;

namespace AlphaTab.Rendering.Effects
{
    public class MarkerEffectInfo : IEffectBarRendererInfo
    {
        public bool HideOnMultiTrack { get { return true; } }
        public bool ShouldCreateGlyph(EffectBarRenderer renderer, Beat beat)
        {
            return beat.Index == 0 && beat.Voice.Bar.MasterBar.IsSectionStart;
        }

        public EffectBarGlyphSizing SizingMode { get { return EffectBarGlyphSizing.SinglePreBeatOnly; } }
        public int GetHeight(EffectBarRenderer renderer)
        {
            return (int)(20 * renderer.Scale);
        }

        public Glyph CreateNewGlyph(EffectBarRenderer renderer, Beat beat)
        {
            return new TextGlyph(0, 0, beat.Voice.Bar.MasterBar.Section.Text, renderer.Resources.MarkerFont);
        }

        public bool CanExpand(EffectBarRenderer renderer, Beat @from, Beat to)
        {
            return true;
        }
    }
}