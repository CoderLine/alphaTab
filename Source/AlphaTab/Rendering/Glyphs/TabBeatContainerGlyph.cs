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

using AlphaTab.Collections;
using AlphaTab.Model;
using AlphaTab.Platform;
using AlphaTab.Rendering.Staves;

namespace AlphaTab.Rendering.Glyphs
{
    public class TabBeatContainerGlyph : BeatContainerGlyph
    {
        private FastList<BendGlyph> _bendGlyphs;
        public TabBeatContainerGlyph(Beat beat, VoiceContainerGlyph voiceContainer)
            : base(beat, voiceContainer)
        {
        }

        public override void DoLayout()
        {
            base.DoLayout();

            _bendGlyphs = new FastList<BendGlyph>();
            for (int i = 0; i < Beat.Notes.Count; i++)
            {
                var n = Beat.Notes[i];
                if (n.HasBend)
                {
                    var bendValueHeight = 6;
                    var bendHeight = n.MaxBendPoint.Value * bendValueHeight;
                    Renderer.RegisterOverflowTop(bendHeight);

                    var bend = new BendGlyph(n, bendValueHeight);
                    bend.X = OnNotes.X + OnNotes.Width;
                    bend.Renderer = Renderer;
                    _bendGlyphs.Add(bend);
                }
            }
        }

        public override void ScaleToWidth(float beatWidth)
        {
            base.ScaleToWidth(beatWidth);

            for (int i = 0; i < _bendGlyphs.Count; i++)
            {
                var g = _bendGlyphs[i];
                g.Width = beatWidth - g.X;
            }
        }

        protected override void CreateTies(Note n)
        {
            var renderer = (TabBarRenderer) Renderer;
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
        }

        public override void Paint(float cx, float cy, ICanvas canvas)
        {
            base.Paint(cx, cy, canvas);

            for (int i = 0; i < _bendGlyphs.Count; i++)
            {
                var g = _bendGlyphs[i];
                g.Paint(cx + X, cy + Y, canvas);
            }
        }
    }
}
