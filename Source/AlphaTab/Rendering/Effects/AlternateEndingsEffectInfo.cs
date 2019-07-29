using AlphaTab.Model;
using AlphaTab.Rendering.Glyphs;

namespace AlphaTab.Rendering.Effects
{
    internal class AlternateEndingsEffectInfo : IEffectBarRendererInfo
    {
        public string EffectId => "alternate-feel";
        public bool HideOnMultiTrack => true;
        public bool CanShareBand => false;
        public EffectBarGlyphSizing SizingMode => EffectBarGlyphSizing.FullBar;

        public bool ShouldCreateGlyph(Settings settings, Beat beat)
        {
            return beat.Index == 0 && beat.Voice.Bar.MasterBar.AlternateEndings != 0;
        }

        public EffectGlyph CreateNewGlyph(BarRendererBase renderer, Beat beat)
        {
            return new AlternateEndingsGlyph(0, 0, beat.Voice.Bar.MasterBar.AlternateEndings);
        }

        public bool CanExpand(Beat from, Beat to)
        {
            return true;
        }
    }
}
