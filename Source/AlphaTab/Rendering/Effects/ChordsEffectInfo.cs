using AlphaTab.Model;
using AlphaTab.Platform.Model;
using AlphaTab.Rendering.Glyphs;

namespace AlphaTab.Rendering.Effects
{
    class ChordsEffectInfo : IEffectBarRendererInfo
    {
        public string EffectId { get { return "chords"; } }
        public bool HideOnMultiTrack { get { return false; } }
        public bool CanShareBand { get { return true; } }
        public EffectBarGlyphSizing SizingMode { get { return EffectBarGlyphSizing.SingleOnBeat; } }

        public bool ShouldCreateGlyph(Settings settings, Beat beat)
        {
            return beat.HasChord;
        }
      
        public EffectGlyph CreateNewGlyph(BarRendererBase renderer, Beat beat)
        {
            return new TextGlyph(0, 0, beat.Chord.Name, renderer.Resources.EffectFont, TextAlign.Center);
        }

        public bool CanExpand(Beat from, Beat to)
        {
            return false;
        }
    }
}