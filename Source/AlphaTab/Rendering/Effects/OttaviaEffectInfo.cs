using System;
using AlphaTab.Model;
using AlphaTab.Rendering.Glyphs;

namespace AlphaTab.Rendering.Effects
{
    class OttaviaEffectInfo : IEffectBarRendererInfo
    {
        private readonly bool _aboveStaff;
        public string EffectId => "ottavia-" + (_aboveStaff ? "above" : "below");
        public bool HideOnMultiTrack => false;
        public bool CanShareBand => true;
        public EffectBarGlyphSizing SizingMode => EffectBarGlyphSizing.GroupedOnBeat;

        public OttaviaEffectInfo(bool aboveStaff)
        {
            _aboveStaff = aboveStaff;
        }

        public bool ShouldCreateGlyph(Settings settings, Beat beat)
        {
            switch (beat.Ottava)
            {
                case Ottavia._15ma:
                    return _aboveStaff;
                case Ottavia._8va:
                    return _aboveStaff;
                case Ottavia._8vb:
                    return !_aboveStaff;
                case Ottavia._15mb:
                    return !_aboveStaff;
            }
            return false;
        }

        public EffectGlyph CreateNewGlyph(BarRendererBase renderer, Beat beat)
        {
            return new OttavaGlyph(beat.Ottava, _aboveStaff);
        }

        public bool CanExpand(Beat from, Beat to)
        {
            return from.Ottava == to.Ottava;
        }
    }
}