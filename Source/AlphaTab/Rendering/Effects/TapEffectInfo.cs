using AlphaTab.Model;
using AlphaTab.Rendering.Glyphs;

namespace AlphaTab.Rendering.Effects
{
    internal class TapEffectInfo : IEffectBarRendererInfo
    {
        public string EffectId => "tap";
        public bool HideOnMultiTrack => false;
        public bool CanShareBand => true;
        public EffectBarGlyphSizing SizingMode => EffectBarGlyphSizing.SingleOnBeat;

        public bool ShouldCreateGlyph(Settings settings, Beat beat)
        {
            return beat.Slap || beat.Pop || beat.Tap;
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

        public bool CanExpand(Beat from, Beat to)
        {
            return true;
        }
    }
}
