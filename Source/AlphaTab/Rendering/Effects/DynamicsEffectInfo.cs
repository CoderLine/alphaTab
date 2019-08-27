using AlphaTab.Model;
using AlphaTab.Rendering.Glyphs;

namespace AlphaTab.Rendering.Effects
{
    internal class DynamicsEffectInfo : IEffectBarRendererInfo
    {
        public string EffectId => "dynamics";
        public bool HideOnMultiTrack => false;
        public bool CanShareBand => false;
        public EffectBarGlyphSizing SizingMode => EffectBarGlyphSizing.SingleOnBeat;

        public bool ShouldCreateGlyph(Settings settings, Beat beat)
        {
            return InternalShouldCreateGlyph(beat);
        }

        private bool InternalShouldCreateGlyph(Beat beat)
        {
            if (beat.Voice.Bar.Staff.Track.Score.Stylesheet.HideDynamics || beat.IsEmpty || beat.Voice.IsEmpty)
            {
                return false;
            }

            var show = beat.Voice.Index == 0 && beat.Index == 0 && beat.Voice.Bar.Index == 0 ||
                       beat.PreviousBeat != null && beat.Dynamics != beat.PreviousBeat.Dynamics;

            // ensure we do not show duplicate dynamics
            if (show && beat.Voice.Index > 0)
            {
                foreach (var voice in beat.Voice.Bar.Voices)
                {
                    if (voice.Index < beat.Voice.Index)
                    {
                        var beatAtSamePos = voice.GetBeatAtDisplayStart(beat.DisplayStart);
                        if (beatAtSamePos != null && beat.Dynamics == beatAtSamePos.Dynamics &&
                            InternalShouldCreateGlyph(beatAtSamePos))
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
            return new DynamicsGlyph(0, 0, beat.Dynamics);
        }

        public bool CanExpand(Beat from, Beat to)
        {
            return true;
        }
    }
}
