using AlphaTab.Model;
using AlphaTab.Rendering.Glyphs;

namespace AlphaTab.Rendering.Effects
{
    internal class LyricsEffectInfo : IEffectBarRendererInfo
    {
        public string EffectId => "lyrics";
        public bool HideOnMultiTrack => false;
        public bool CanShareBand => false;
        public EffectBarGlyphSizing SizingMode => EffectBarGlyphSizing.SingleOnBeat;

        public bool ShouldCreateGlyph(Settings settings, Beat beat)
        {
            return beat.Lyrics != null;
        }

        public EffectGlyph CreateNewGlyph(BarRendererBase renderer, Beat beat)
        {
            return new LyricsGlyph(0, 0, beat.Lyrics, renderer.Resources.EffectFont);
        }

        public bool CanExpand(Beat from, Beat to)
        {
            return true;
        }
    }
}
