using AlphaTab.Model;
using AlphaTab.Rendering.Glyphs;

namespace AlphaTab.Rendering.Effects
{
    class DynamicsEffectInfo : IEffectBarRendererInfo
    {
        public string EffectId { get { return "dynamics"; } }
        public bool HideOnMultiTrack { get { return false; } }
        public bool CanShareBand { get { return false; } }
        public EffectBarGlyphSizing SizingMode { get { return EffectBarGlyphSizing.SingleOnBeat; } }

        public bool ShouldCreateGlyph(Settings settings, Beat beat)
        {
            return InternalShouldCreateGlyph(settings, beat, true);
        }

        private bool InternalShouldCreateGlyph(Settings settings, Beat beat, bool checkForDuplicates)
        {
            if (beat.Voice.Bar.Staff.Track.Score.Stylesheet.HideDynamics || beat.IsEmpty || beat.Voice.IsEmpty)
            {
                return false;
            }

            var show = ((beat.Voice.Index == 0 && beat.Index == 0 && beat.Voice.Bar.Index == 0) || (beat.PreviousBeat != null && beat.Dynamic != beat.PreviousBeat.Dynamic));

            // ensure we do not show duplicate dynamics
            if (show && beat.Voice.Index > 0)
            {
                foreach (var voice in beat.Voice.Bar.Voices)
                {
                    if (voice.Index < beat.Voice.Index)
                    {
                        var beatAtSamePos = voice.GetBeatAtDisplayStart(beat.DisplayStart);
                        if (beatAtSamePos != null && beat.Dynamic == beatAtSamePos.Dynamic && InternalShouldCreateGlyph(settings, beatAtSamePos, false))
                        {
                            show = false;
                        }
                    }
                }
            }

            return show;
        }

        public EffectGlyph CreateNewGlyph(BarRendererBase renderer, Beat beat)
        {
            return new DynamicsGlyph(0, 0, beat.Dynamic);
        }

        public bool CanExpand(Beat @from, Beat to)
        {
            return true;
        }
    }
}