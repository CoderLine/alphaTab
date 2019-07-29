using AlphaTab.Model;
using AlphaTab.Platform;
using AlphaTab.Rendering.Glyphs;

namespace AlphaTab.Rendering.Effects
{
    class LyricsEffectInfo : IEffectBarRendererInfo
    {
        public string EffectId { get { return "lyrics"; } }
        public bool HideOnMultiTrack { get { return false; } }
        public bool CanShareBand { get { return false; } }
        public EffectBarGlyphSizing SizingMode { get { return EffectBarGlyphSizing.SingleOnBeat; } }

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