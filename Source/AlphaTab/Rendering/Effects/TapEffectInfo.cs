using AlphaTab.Model;
using AlphaTab.Rendering.Glyphs;

namespace AlphaTab.Rendering.Effects
{
    class TapEffectInfo : IEffectBarRendererInfo
    {
        public string EffectId { get { return "tap"; } }
        public bool HideOnMultiTrack { get { return false; } }
        public bool CanShareBand { get { return true; } }
        public EffectBarGlyphSizing SizingMode { get { return EffectBarGlyphSizing.SingleOnBeat; } }

        public bool ShouldCreateGlyph(Settings settings, Beat beat)
        {
            return (beat.Slap || beat.Pop || beat.Tap);
        }


        public EffectGlyph CreateNewGlyph(BarRendererBase renderer, Beat beat)
        {
            var res = renderer.Resources;
            if (beat.Slap)
            {
                return new TextGlyph(0, 0, "S", res.EffectFont);
            }
            if (beat.Pop)
            {
                return new TextGlyph(0, 0, "P", res.EffectFont);
            }
            return new TextGlyph(0, 0, "T", res.EffectFont);
        }

        public bool CanExpand(Beat @from, Beat to)
        {
            return true;
        }
    }
}