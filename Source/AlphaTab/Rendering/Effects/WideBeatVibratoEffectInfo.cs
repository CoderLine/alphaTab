using AlphaTab.Model;
using AlphaTab.Rendering.Glyphs;

namespace AlphaTab.Rendering.Effects
{
    internal class WideBeatVibratoEffectInfo : IEffectBarRendererInfo
    {
        public string EffectId => "wide-beat-vibrato";
        public bool HideOnMultiTrack => false;
        public bool CanShareBand => true;
        public EffectBarGlyphSizing SizingMode => EffectBarGlyphSizing.GroupedOnBeatToEnd;

        public bool ShouldCreateGlyph(Settings settings, Beat beat)
        {
            return beat.Vibrato == VibratoType.Wide;
        }

        public EffectGlyph CreateNewGlyph(BarRendererBase renderer, Beat beat)
        {
            return new BeatVibratoGlyph(VibratoType.Wide);
        }

        public bool CanExpand(Beat from, Beat to)
        {
            return true;
        }
    }
}
