using AlphaTab.Model;
using AlphaTab.Rendering.Glyphs;

namespace AlphaTab.Rendering.Effects
{
    internal class CapoEffectInfo : IEffectBarRendererInfo
    {
        public string EffectId => "capo";
        public bool HideOnMultiTrack => false;
        public bool CanShareBand => false;
        public EffectBarGlyphSizing SizingMode => EffectBarGlyphSizing.SingleOnBeat;

        public bool ShouldCreateGlyph(Settings settings, Beat beat)
        {
            return beat.Index == 0 && beat.Voice.Bar.Index == 0 && beat.Voice.Bar.Staff.Capo != 0;
        }

        public EffectGlyph CreateNewGlyph(BarRendererBase renderer, Beat beat)
        {
            return new TextGlyph(0, 0, "Capo. fret " + beat.Voice.Bar.Staff.Capo, renderer.Resources.EffectFont);
        }

        public bool CanExpand(Beat from, Beat to)
        {
            return false;
        }
    }
}
