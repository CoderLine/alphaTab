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
using AlphaTab.Rendering.Glyphs;

namespace AlphaTab.Rendering
{
    public class ScoreBeatContainerGlyph : BeatContainerGlyph
    {
        public ScoreBeatContainerGlyph(Beat beat) : base(beat)
        {
        }

        protected override void CreateTies(Note n)
        {
            // create a tie if any effect requires it

            // NOTE: we create 2 tie glyphs if we have a line break inbetween 
            // the two notes
            if (n.IsTieOrigin) 
            {
                var tie = new ScoreTieGlyph(n, n.TieDestination, this);
                Ties.Add(tie);
            }
            if (n.IsTieDestination)
            {
                var tie = new ScoreTieGlyph(n.TieOrigin, n, this, true);
                Ties.Add(tie);
            }
            else if (n.IsHammerPullOrigin)
            {
                var tie = new ScoreTieGlyph(n, n.HammerPullDestination, this);
                Ties.Add(tie);
            }
            else if (n.SlideType == SlideType.Legato)
            {
                var tie = new ScoreTieGlyph(n, n.SlideTarget, this);
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
