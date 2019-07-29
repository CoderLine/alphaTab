using AlphaTab.Model;
using AlphaTab.Rendering.Glyphs;

namespace AlphaTab.Rendering.Effects
{
    class PickStrokeEffectInfo : IEffectBarRendererInfo
    {
        public string EffectId { get { return "pick-stroke"; } }
        public bool HideOnMultiTrack { get { return false; } }
        public bool CanShareBand { get { return true; } }
        public EffectBarGlyphSizing SizingMode { get { return EffectBarGlyphSizing.SingleOnBeat; } }

        public bool ShouldCreateGlyph(Settings settings, Beat beat)
        {
            return beat.PickStroke != PickStroke.None;
        }

        public EffectGlyph CreateNewGlyph(BarRendererBase renderer, Beat beat)
        {
            return new PickStrokeGlyph(0, 0, beat.PickStroke);
        }

        public bool CanExpand(Beat @from, Beat to)
        {
            return true;
        }
    }
}