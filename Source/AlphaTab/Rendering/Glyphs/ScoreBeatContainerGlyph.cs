/*
 * This file is part of alphaTab.
 * Copyright © 2017, Daniel Kuschny and Contributors, All rights reserved.
 * 
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3.0 of the License, or at your option any later version.
 * 
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library.
 */
using AlphaTab.Model;
using AlphaTab.Rendering.Glyphs;

namespace AlphaTab.Rendering
{
    public class ScoreBeatContainerGlyph : BeatContainerGlyph
    {
        public ScoreBeatContainerGlyph(Beat beat, VoiceContainerGlyph voiceContainer) : base(beat, voiceContainer)
        {
        }

        public override void DoLayout()
        {
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
        }

        protected override void CreateTies(Note n)
        {
            // create a tie if any effect requires it

            // NOTE: we create 2 tie glyphs if we have a line break inbetween 
            // the two notes
            if (n.IsTieOrigin) 
            {
                var tie = new ScoreTieGlyph(n, n.TieDestination);
                Ties.Add(tie);
            }
            if (n.IsTieDestination)
            {
                var tie = new ScoreTieGlyph(n.TieOrigin, n, true);
                Ties.Add(tie);
            }
            else if (n.IsHammerPullOrigin)
            {
                // only create tie for very first origin of "group"
                if (n.HammerPullOrigin == null)
                {
                    // tie with end note
                    Note destination = n.HammerPullDestination;
                    while (destination.HammerPullDestination != null)
                    {
                        destination = destination.HammerPullDestination;
                    }
                    var tie = new ScoreTieGlyph(n, destination);
                    Ties.Add(tie);
                }
            }
            else if (n.IsHammerPullDestination)
            {
                // only create tie for last destination of "group"
                // NOTE: HOPOs over more than 2 staffs does not work with this mechanism, but this sounds unrealistic
                if (n.HammerPullDestination == null)
                {
                    Note origin = n.HammerPullOrigin;
                    while (origin.HammerPullOrigin != null)
                    {
                        origin = origin.HammerPullOrigin;
                    }
                    var tie = new ScoreTieGlyph(origin, n, true);
                    Ties.Add(tie);
                }
            }
            else if (n.SlideType == SlideType.Legato)
            {
                var tie = new ScoreTieGlyph(n, n.SlideTarget);
                Ties.Add(tie);
            }

            // TODO: depending on the type we have other positioning
            // we should place glyphs in the preNotesGlyph or postNotesGlyph if needed
            if (n.SlideType != SlideType.None)
            {
                var l = new ScoreSlideLineGlyph(n.SlideType, n, this);
                Ties.Add(l);
            }
        }
    }
}
