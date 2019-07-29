using AlphaTab.Model;
using AlphaTab.Rendering.Glyphs;

namespace AlphaTab.Rendering.Effects
{
    internal class MarkerEffectInfo : IEffectBarRendererInfo
    {
        public string EffectId => "marker";
        public bool HideOnMultiTrack => true;
        public bool CanShareBand => true;
        public EffectBarGlyphSizing SizingMode => EffectBarGlyphSizing.SinglePreBeat;

        public bool ShouldCreateGlyph(Settings settings, Beat beat)
        {
            return beat.Voice.Bar.Staff.Index == 0 && beat.Voice.Index == 0 && beat.Index == 0 &&
                   beat.Voice.Bar.MasterBar.IsSectionStart;
        }

        public EffectGlyph CreateNewGlyph(BarRendererBase renderer, Beat beat)
        {
            return new TextGlyph(0,
                0,
                string.IsNullOrEmpty(beat.Voice.Bar.MasterBar.Section.Marker)
                    ? beat.Voice.Bar.MasterBar.Section.Text
                    : "[" + beat.Voice.Bar.MasterBar.Section.Marker + "] " + beat.Voice.Bar.MasterBar.Section.Text,
                renderer.Resources.MarkerFont);
        }

        public bool CanExpand(Beat from, Beat to)
        {
            return true;
        }
    }
}
