using AlphaTab.Model;
using AlphaTab.Rendering.Glyphs;

namespace AlphaTab.Rendering.Effects
{
    public class DynamicsEffectInfo : IEffectBarRendererInfo
    {
        public bool HideOnMultiTrack { get { return false; } }
        public bool ShouldCreateGlyph(EffectBarRenderer renderer, Beat beat)
        {
            return beat.Voice.Index == 0 &&
                   ((beat.Index == 0 && beat.Voice.Bar.Index == 0) || (beat.PreviousBeat != null && beat.Dynamic != beat.PreviousBeat.Dynamic));
        }

        public EffectBarGlyphSizing SizingMode { get { return EffectBarGlyphSizing.SingleOnBeatOnly; } }
        public int GetHeight(EffectBarRenderer renderer)
        {
            return (int)(15 * renderer.Scale);
        }

        public EffectGlyph CreateNewGlyph(EffectBarRenderer renderer, Beat beat)
        {
            return new DynamicsGlyph(0, 0, beat.Dynamic);
        }

        public bool CanExpand(EffectBarRenderer renderer, Beat @from, Beat to)
        {
            return true;
        }
    }
}