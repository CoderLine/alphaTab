using AlphaTab.Model;
using AlphaTab.Rendering.Glyphs;

namespace AlphaTab.Rendering.Effects
{
    class WideBeatVibratoEffectInfo : IEffectBarRendererInfo
    {
        public string EffectId { get { return "wide-beat-vibrato"; } }
        public bool HideOnMultiTrack { get { return false; } }
        public bool CanShareBand { get { return true; } }
        public EffectBarGlyphSizing SizingMode { get { return EffectBarGlyphSizing.GroupedOnBeatToEnd; } }

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
