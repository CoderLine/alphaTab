using AlphaTab.Model;
using AlphaTab.Rendering.Glyphs;

namespace AlphaTab.Rendering.Effects
{
    class TripletFeelEffectInfo : IEffectBarRendererInfo
    {
        public string EffectId { get { return "triplet-feel"; } }
        public bool HideOnMultiTrack { get { return true; } }
        public bool CanShareBand { get { return false; } }
        public EffectBarGlyphSizing SizingMode { get { return EffectBarGlyphSizing.SinglePreBeat; } }

        public bool ShouldCreateGlyph(Settings settings, Beat beat)
        {
            return beat.Index == 0 &&
                (
                    (beat.Voice.Bar.MasterBar.Index == 0 && beat.Voice.Bar.MasterBar.TripletFeel != TripletFeel.NoTripletFeel)
                    || (beat.Voice.Bar.MasterBar.Index > 0 && beat.Voice.Bar.MasterBar.TripletFeel != beat.Voice.Bar.MasterBar.PreviousMasterBar.TripletFeel)
                );
        }


        public EffectGlyph CreateNewGlyph(BarRendererBase renderer, Beat beat)
        {
            return new TripletFeelGlyph(beat.Voice.Bar.MasterBar.TripletFeel);
        }

        public bool CanExpand(Beat @from, Beat to)
        {
            return true;
        }
    }
}