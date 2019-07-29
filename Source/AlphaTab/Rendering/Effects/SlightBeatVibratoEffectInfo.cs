using AlphaTab.Model;
using AlphaTab.Rendering.Glyphs;

namespace AlphaTab.Rendering.Effects
{
    internal class SlightBeatVibratoEffectInfo : IEffectBarRendererInfo
    {
        public string EffectId => "slight-beat-vibrato";
        public bool HideOnMultiTrack => false;
        public bool CanShareBand => true;
        public EffectBarGlyphSizing SizingMode => EffectBarGlyphSizing.GroupedOnBeatToEnd;

        public bool ShouldCreateGlyph(Settings settings, Beat beat)
        {
            return beat.Vibrato == VibratoType.Slight;
        }

        public EffectGlyph CreateNewGlyph(BarRendererBase renderer, Beat beat)
        {
            return new BeatVibratoGlyph(VibratoType.Slight);
        }

        public bool CanExpand(Beat from, Beat to)
        {
            return true;
        }
    }
}
