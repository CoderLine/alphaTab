using AlphaTab.Model;
using AlphaTab.Rendering.Glyphs;

namespace AlphaTab.Rendering.Effects
{
    internal class WhammyBarEffectInfo : IEffectBarRendererInfo
    {
        public string EffectId => "whammy";
        public bool HideOnMultiTrack => false;
        public bool CanShareBand => false;
        public EffectBarGlyphSizing SizingMode => EffectBarGlyphSizing.GroupedOnBeat;

        public bool ShouldCreateGlyph(Settings settings, Beat beat)
        {
            return beat.HasWhammyBar;
        }

        public EffectGlyph CreateNewGlyph(BarRendererBase renderer, Beat beat)
        {
            return new LineRangedGlyph("w/bar");
        }

        public bool CanExpand(Beat from, Beat to)
        {
            return true;
        }
    }
}
