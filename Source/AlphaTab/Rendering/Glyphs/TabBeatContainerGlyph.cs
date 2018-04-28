/*
 * This file is part of alphaTab.
 * Copyright © 2018, Daniel Kuschny and Contributors, All rights reserved.
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

using AlphaTab.Collections;
using AlphaTab.Model;
using AlphaTab.Platform;
using AlphaTab.Rendering.Staves;

namespace AlphaTab.Rendering.Glyphs
{
    public class TabBeatContainerGlyph : BeatContainerGlyph
    {
        public TabBeatContainerGlyph(Beat beat, VoiceContainerGlyph voiceContainer)
            : base(beat, voiceContainer)
        {
        }

        protected override void CreateTies(Note n)
        {
            var renderer = (TabBarRenderer)Renderer;
            if (n.IsTieOrigin && renderer.ShowTiedNotes)
            {
                var tie = new TabTieGlyph(n, n.TieDestination, false);
                Ties.Add(tie);
            }
            if (n.IsTieDestination && renderer.ShowTiedNotes)
            {
                var tie = new TabTieGlyph(n.TieOrigin, n, false, true);
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
                    var tie = new TabTieGlyph(n, destination, false);
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
                    var tie = new TabTieGlyph(origin, n, false, true);
                    Ties.Add(tie);
                }
            }
            else if (n.SlideType == SlideType.Legato)
            {
                var tie = new TabTieGlyph(n, n.SlideTarget, true, false);
                Ties.Add(tie);
            }

            if (n.SlideType != SlideType.None)
            {
                var l = new TabSlideLineGlyph(n.SlideType, n, this);
                Ties.Add(l);
            }

            if (n.HasBend)
            {
                var bend = new TabBendGlyph(n);
                bend.Renderer = renderer;
                bend.DoLayout();
                Ties.Add(bend);
            }
        }
    }
}
