using System;
using AlphaTab.Collections;
using AlphaTab.Model;
using AlphaTab.Rendering.Glyphs;
using AlphaTab.Rendering.Staves;
using AlphaTab.Rendering.Utils;

namespace AlphaTab.Rendering
{
    class ScoreBeatContainerGlyph : BeatContainerGlyph
    {
        private ScoreBendGlyph _bend;
        private ScoreSlurGlyph _effectSlur;
        private ScoreSlurGlyph _effectEndSlur;

        public ScoreBeatContainerGlyph(Beat beat, VoiceContainerGlyph voiceContainer) : base(beat, voiceContainer)
        {
        }

        public override void DoLayout()
        {
            _effectSlur = null;
            _effectEndSlur = null;
            base.DoLayout();
            if (Beat.IsLegatoOrigin)
            {
                // only create slur for very first origin of "group"
                if (Beat.PreviousBeat == null || !Beat.PreviousBeat.IsLegatoOrigin)
                {
                    // tie with end beat
                    Beat destination = Beat.NextBeat;
                    while (destination.NextBeat != null && destination.NextBeat.IsLegatoDestination)
                    {
                        destination = destination.NextBeat;
                    }
                    Ties.Add(new ScoreLegatoGlyph(Beat, destination));
                }
            }
            else if (Beat.IsLegatoDestination)
            {
                // only create slur for last destination of "group"
                if (!Beat.IsLegatoOrigin)
                {
                    Beat origin = Beat.PreviousBeat;
                    while (origin.PreviousBeat != null && origin.PreviousBeat.IsLegatoOrigin)
                    {
                        origin = origin.PreviousBeat;
                    }
                    Ties.Add(new ScoreLegatoGlyph(origin, Beat, true));
                }
            }
            if (_bend != null)
            {
                _bend.Renderer = Renderer;
                _bend.DoLayout();
                UpdateWidth();
            }
        }

        protected override void CreateTies(Note n)
        {
            // create a tie if any effect requires it
            if (!n.IsVisible) return;

            // NOTE: we create 2 tie glyphs if we have a line break inbetween 
            // the two notes
            if (n.IsTieOrigin && !n.HasBend && !n.Beat.HasWhammyBar && n.Beat.GraceType != GraceType.BendGrace && n.TieDestination != null && n.TieDestination.IsVisible)
            {
                var tie = new ScoreTieGlyph(n, n.TieDestination);
                Ties.Add(tie);
            }

            if (n.IsTieDestination && !n.TieOrigin.HasBend && !n.Beat.HasWhammyBar)
            {
                var tie = new ScoreTieGlyph(n.TieOrigin, n, true);
                Ties.Add(tie);
            }

            // TODO: depending on the type we have other positioning
            // we should place glyphs in the preNotesGlyph or postNotesGlyph if needed
            if (n.SlideType != SlideType.None)
            {
                var l = new ScoreSlideLineGlyph(n.SlideType, n, this);
                Ties.Add(l);
            }

            if (n.IsSlurOrigin && n.SlurDestination != null && n.SlurDestination.IsVisible)
            {
                var tie = new ScoreSlurGlyph(n, n.SlurDestination, false);
                Ties.Add(tie);
            }

            if (n.IsSlurDestination)
            {
                var tie = new ScoreSlurGlyph(n.SlurOrigin, n, true);
                Ties.Add(tie);
            }

            // start effect slur on first beat
            if (_effectSlur == null && n.Beat.IsEffectSlurOrigin && n.Beat.EffectSlurDestination != null)
            {
                var direction = OnNotes.BeamingHelper.Direction;

                var startNote = direction == BeamDirection.Up ? n.Beat.MinNote : n.Beat.MaxNote;
                var endNote = direction == BeamDirection.Up ? n.Beat.EffectSlurDestination.MinNote : n.Beat.EffectSlurDestination.MaxNote;

                _effectSlur = new ScoreSlurGlyph(startNote, endNote, false);
                Ties.Add(_effectSlur);
            }
            // end effect slur on last beat
            if (_effectEndSlur == null && n.Beat.IsEffectSlurDestination && n.Beat.EffectSlurOrigin != null)
            {
                var direction = OnNotes.BeamingHelper.Direction;

                var startNote = direction == BeamDirection.Up ? n.Beat.EffectSlurOrigin.MinNote : n.Beat.EffectSlurOrigin.MaxNote;
                var endNote = direction == BeamDirection.Up ? n.Beat.MinNote : n.Beat.MaxNote;

                _effectEndSlur = new ScoreSlurGlyph(startNote, endNote, true);
                Ties.Add(_effectEndSlur);
            }

            if (n.HasBend)
            {
                if (_bend == null)
                {
                    _bend = new ScoreBendGlyph(n.Beat);
                    _bend.Renderer = Renderer;
                    Ties.Add(_bend);
                }
                _bend.AddBends(n);
            }
        }
    }
}
