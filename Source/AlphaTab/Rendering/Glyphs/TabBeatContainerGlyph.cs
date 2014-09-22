/*
 * This file is part of alphaTab.
 * Copyright (c) 2014, Daniel Kuschny and Contributors, All rights reserved.
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

namespace AlphaTab.Rendering.Glyphs
{
    public class TabBeatContainerGlyph : BeatContainerGlyph
    {
        public TabBeatContainerGlyph(Beat beat)
            : base(beat)
        {
        }

        protected override void CreateTies(Note n)
        {
            if (n.IsHammerPullOrigin)
            {
                var tie = new TabTieGlyph(n, n.HammerPullDestination, this);
                Ties.Add(tie);
            }
            else if (n.SlideType == SlideType.Legato)
            {
                var tie = new TabTieGlyph(n, n.SlideTarget, this);
                Ties.Add(tie);
            }

            if (n.SlideType != SlideType.None)
            {
                var l = new TabSlideLineGlyph(n.SlideType, n, this);
                Ties.Add(l);
            }
        }
    }
}
