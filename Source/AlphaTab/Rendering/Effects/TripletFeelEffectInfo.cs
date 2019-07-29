using AlphaTab.Model;
using AlphaTab.Rendering.Glyphs;

namespace AlphaTab.Rendering.Effects
{
    internal class TripletFeelEffectInfo : IEffectBarRendererInfo
    {
        public string EffectId => "triplet-feel";
        public bool HideOnMultiTrack => true;
        public bool CanShareBand => false;
        public EffectBarGlyphSizing SizingMode => EffectBarGlyphSizing.SinglePreBeat;

        public bool ShouldCreateGlyph(Settings settings, Beat beat)
        {
            return beat.Index == 0 &&
                   (
                       beat.Voice.Bar.MasterBar.Index == 0 &&
                       beat.Voice.Bar.MasterBar.TripletFeel != TripletFeel.NoTripletFeel
                       || beat.Voice.Bar.MasterBar.Index > 0 && beat.Voice.Bar.MasterBar.TripletFeel !=
                       beat.Voice.Bar.MasterBar.PreviousMasterBar.TripletFeel
                   );
        }


        public EffectGlyph CreateNewGlyph(BarRendererBase renderer, Beat beat)
        {
            return new TripletFeelGlyph(beat.Voice.Bar.MasterBar.TripletFeel);
        }

        public bool CanExpand(Beat from, Beat to)
        {
            return true;
        }
    }
}
