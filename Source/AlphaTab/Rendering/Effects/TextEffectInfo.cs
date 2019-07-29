using AlphaTab.Model;
using AlphaTab.Rendering.Glyphs;

namespace AlphaTab.Rendering.Effects
{
    internal class TextEffectInfo : IEffectBarRendererInfo
    {
        public string EffectId => "text";
        public bool HideOnMultiTrack => false;
        public bool CanShareBand => false;
        public EffectBarGlyphSizing SizingMode => EffectBarGlyphSizing.SingleOnBeat;

        public bool ShouldCreateGlyph(Settings settings, Beat beat)
        {
            return !string.IsNullOrWhiteSpace(beat.Text);
        }


        public EffectGlyph CreateNewGlyph(BarRendererBase renderer, Beat beat)
        {
            return new TextGlyph(0, 0, beat.Text, renderer.Resources.EffectFont);
        }

        public bool CanExpand(Beat from, Beat to)
        {
            return true;
        }
    }
}
