using AlphaTab.Model;
using AlphaTab.Platform;
using AlphaTab.Rendering.Glyphs;

namespace AlphaTab.Rendering.Effects
{
    class TextEffectInfo : IEffectBarRendererInfo
    {
        public string EffectId { get { return "text"; } }
        public bool HideOnMultiTrack { get { return false; } }
        public bool CanShareBand { get { return false; } }
        public EffectBarGlyphSizing SizingMode { get { return EffectBarGlyphSizing.SingleOnBeat; } }

        public bool ShouldCreateGlyph(Settings settings, Beat beat)
        {
            return !string.IsNullOrWhiteSpace(beat.Text);
        }


        public EffectGlyph CreateNewGlyph(BarRendererBase renderer, Beat beat)
        {
            return new TextGlyph(0, 0, beat.Text, renderer.Resources.EffectFont);
        }

        public bool CanExpand(Beat @from, Beat to)
        {
            return true;
        }
    }
}