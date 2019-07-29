using AlphaTab.Model;
using AlphaTab.Rendering.Glyphs;

namespace AlphaTab.Rendering.Effects
{
    class AlternateEndingsEffectInfo : IEffectBarRendererInfo
    {
        public string EffectId { get { return "alternate-feel"; } }
        public bool HideOnMultiTrack { get { return true; } }
        public bool CanShareBand { get { return false; } }
        public EffectBarGlyphSizing SizingMode { get { return EffectBarGlyphSizing.FullBar; } }

        public bool ShouldCreateGlyph(Settings settings, Beat beat)
        {
            return beat.Index == 0 && beat.Voice.Bar.MasterBar.AlternateEndings != 0;
        }

        public EffectGlyph CreateNewGlyph(BarRendererBase renderer, Beat beat)
        {
            return new AlternateEndingsGlyph(0,0, beat.Voice.Bar.MasterBar.AlternateEndings);
        }

        public bool CanExpand(Beat from, Beat to)
        {
            return true;
        }
    }
}