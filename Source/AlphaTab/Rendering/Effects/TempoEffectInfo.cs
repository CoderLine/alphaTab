using AlphaTab.Model;
using AlphaTab.Rendering.Glyphs;

namespace AlphaTab.Rendering.Effects
{
    public class TempoEffectInfo : IEffectBarRendererInfo
    {
        public bool HideOnMultiTrack { get { return true; } }
        public bool ShouldCreateGlyph(EffectBarRenderer renderer, Beat beat)
        {
            return beat.Index == 0 && (beat.Voice.Bar.MasterBar.TempoAutomation != null || beat.Voice.Bar.Index == 0);
        }

        public EffectBarGlyphSizing SizingMode { get { return EffectBarGlyphSizing.SinglePreBeatOnly; } }
        public int GetHeight(EffectBarRenderer renderer)
        {
            return (int)(25 * renderer.Scale);
        }

        public EffectGlyph CreateNewGlyph(EffectBarRenderer renderer, Beat beat)
        {
            int tempo;
            if (beat.Voice.Bar.MasterBar.TempoAutomation != null)
            {
                tempo = (int)(beat.Voice.Bar.MasterBar.TempoAutomation.Value);
            }
            else
            {
                tempo = beat.Voice.Bar.Track.Score.Tempo;
            }
            return new TempoGlyph(0, 0, tempo);
        }

        public bool CanExpand(EffectBarRenderer renderer, Beat @from, Beat to)
        {
            return true;
        }
    }
}