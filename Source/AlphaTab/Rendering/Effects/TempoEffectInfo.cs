using AlphaTab.Model;
using AlphaTab.Rendering.Glyphs;

namespace AlphaTab.Rendering.Effects
{
    class TempoEffectInfo : IEffectBarRendererInfo
    {
        public string EffectId { get { return "tempo"; } }
        public bool HideOnMultiTrack { get { return true; } }
        public bool CanShareBand { get { return false; } }
        public EffectBarGlyphSizing SizingMode { get { return EffectBarGlyphSizing.SinglePreBeat; } }

        public bool ShouldCreateGlyph(Settings settings, Beat beat)
        {
            return beat.Voice.Bar.Staff.Index == 0 && beat.Voice.Index == 0 && beat.Index == 0 && (beat.Voice.Bar.MasterBar.TempoAutomation != null || beat.Voice.Bar.Index == 0);
        }
       
        public EffectGlyph CreateNewGlyph(BarRendererBase renderer, Beat beat)
        {
            int tempo;
            if (beat.Voice.Bar.MasterBar.TempoAutomation != null)
            {
                tempo = (int)(beat.Voice.Bar.MasterBar.TempoAutomation.Value);
            }
            else
            {
                tempo = beat.Voice.Bar.Staff.Track.Score.Tempo;
            }
            return new TempoGlyph(0, 0, tempo);
        }

        public bool CanExpand(Beat @from, Beat to)
        {
            return true;
        }
    }
}