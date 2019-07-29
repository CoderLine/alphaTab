using AlphaTab.Model;
using AlphaTab.Rendering.Glyphs;

namespace AlphaTab.Rendering.Effects
{
    class MarkerEffectInfo : IEffectBarRendererInfo
    {
        public string EffectId { get { return "marker"; } }
        public bool HideOnMultiTrack { get { return true; } }
        public bool CanShareBand { get { return true; } }
        public EffectBarGlyphSizing SizingMode { get { return EffectBarGlyphSizing.SinglePreBeat; } }

        public bool ShouldCreateGlyph(Settings settings, Beat beat)
        {
            return beat.Voice.Bar.Staff.Index == 0 && beat.Voice.Index == 0 && beat.Index == 0 && beat.Voice.Bar.MasterBar.IsSectionStart;
        }
       
        public EffectGlyph CreateNewGlyph(BarRendererBase renderer, Beat beat)
        {
            return new TextGlyph(0, 0, 
                string.IsNullOrEmpty(beat.Voice.Bar.MasterBar.Section.Marker) 
                    ? beat.Voice.Bar.MasterBar.Section.Text
                    : "[" + beat.Voice.Bar.MasterBar.Section.Marker + "] " + beat.Voice.Bar.MasterBar.Section.Text, renderer.Resources.MarkerFont);
        }

        public bool CanExpand(Beat @from, Beat to)
        {
            return true;
        }
    }
}