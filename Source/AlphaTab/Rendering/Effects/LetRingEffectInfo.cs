using AlphaTab.Model;
using AlphaTab.Rendering.Glyphs;

namespace AlphaTab.Rendering.Effects
{
    internal class LetRingEffectInfo : IEffectBarRendererInfo
    {
        public string EffectId => "let-ring";
        public bool CanShareBand => false;
        public virtual bool HideOnMultiTrack => false;

        public bool ShouldCreateGlyph(Settings settings, Beat beat)
        {
            return beat.IsLetRing;
        }

        public EffectBarGlyphSizing SizingMode => EffectBarGlyphSizing.GroupedOnBeat;

        public EffectGlyph CreateNewGlyph(BarRendererBase renderer, Beat beat)
        {
            return new LineRangedGlyph("LetRing");
        }

        public virtual bool CanExpand(Beat from, Beat to)
        {
            return true;
        }
    }
}
