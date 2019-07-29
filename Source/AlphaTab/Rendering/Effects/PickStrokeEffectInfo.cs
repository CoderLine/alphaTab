using AlphaTab.Model;
using AlphaTab.Rendering.Glyphs;

namespace AlphaTab.Rendering.Effects
{
    internal class PickStrokeEffectInfo : IEffectBarRendererInfo
    {
        public string EffectId => "pick-stroke";
        public bool HideOnMultiTrack => false;
        public bool CanShareBand => true;
        public EffectBarGlyphSizing SizingMode => EffectBarGlyphSizing.SingleOnBeat;

        public bool ShouldCreateGlyph(Settings settings, Beat beat)
        {
            return beat.PickStroke != PickStroke.None;
        }

        public EffectGlyph CreateNewGlyph(BarRendererBase renderer, Beat beat)
        {
            return new PickStrokeGlyph(0, 0, beat.PickStroke);
        }

        public bool CanExpand(Beat from, Beat to)
        {
            return true;
        }
    }
}
