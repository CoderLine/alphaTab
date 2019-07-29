using AlphaTab.Model;
using AlphaTab.Rendering.Glyphs;

namespace AlphaTab.Rendering.Effects
{
    class SlightBeatVibratoEffectInfo : IEffectBarRendererInfo
    {
        public string EffectId { get { return "slight-beat-vibrato"; } }
        public bool HideOnMultiTrack { get { return false; } }
        public bool CanShareBand { get { return true; } }
        public EffectBarGlyphSizing SizingMode { get { return EffectBarGlyphSizing.GroupedOnBeatToEnd; } }

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
