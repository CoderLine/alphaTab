using AlphaTab.Model;
using AlphaTab.Rendering.Glyphs;

namespace AlphaTab.Rendering.Effects
{
    internal class TempoEffectInfo : IEffectBarRendererInfo
    {
        public string EffectId => "tempo";
        public bool HideOnMultiTrack => true;
        public bool CanShareBand => false;
        public EffectBarGlyphSizing SizingMode => EffectBarGlyphSizing.SinglePreBeat;

        public bool ShouldCreateGlyph(Settings settings, Beat beat)
        {
            return !settings.Notation.HideBeatInfo && beat.Voice.Bar.Staff.Index == 0 && beat.Voice.Index == 0 && beat.Index == 0 &&
                   (beat.Voice.Bar.MasterBar.TempoAutomation != null || beat.Voice.Bar.Index == 0);
        }

        public EffectGlyph CreateNewGlyph(BarRendererBase renderer, Beat beat)
        {
            int tempo;
            if (beat.Voice.Bar.MasterBar.TempoAutomation != null)
            {
                tempo = (int)beat.Voice.Bar.MasterBar.TempoAutomation.Value;
            }
            else
            {
                tempo = beat.Voice.Bar.Staff.Track.Score.Tempo;
            }

            return new TempoGlyph(0, 0, tempo);
        }

        public bool CanExpand(Beat from, Beat to)
        {
            return true;
        }
    }
}
