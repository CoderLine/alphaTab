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
using AlphaTab.Rendering.Utils;

namespace AlphaTab.Rendering.Glyphs
{
    public class BeamGlyph : MusicFontGlyph
    {
        public BeamGlyph(float x, float y, Duration duration, BeamDirection direction, bool isGrace)
            : base(x, y, isGrace ? NoteHeadGlyph.GraceScale : 1, GetSymbol(duration, direction, isGrace))
        {
        }
        
        public override void DoLayout()
        {
            Width = 0;
        }

        private static MusicFontSymbol GetSymbol(Duration duration, BeamDirection direction, bool isGrace)
        {
            if (direction == BeamDirection.Up)
            {
                if (isGrace)
                {
                    return MusicFontSymbol.FooterUpEighth;
                }
                switch (duration)
                {
                    case Duration.Eighth: return MusicFontSymbol.FooterUpEighth;
                    case Duration.Sixteenth: return MusicFontSymbol.FooterUpSixteenth;
                    case Duration.ThirtySecond: return MusicFontSymbol.FooterUpThirtySecond;
                    case Duration.SixtyFourth: return MusicFontSymbol.FooterUpSixtyFourth;
                    default: return MusicFontSymbol.FooterUpEighth;
                }
            }
            else
            {
                if (isGrace)
                {
                    return MusicFontSymbol.FooterDownEighth;
                }
                switch (duration)
                {
                    case Duration.Eighth: return MusicFontSymbol.FooterDownEighth;
                    case Duration.Sixteenth: return MusicFontSymbol.FooterDownSixteenth;
                    case Duration.ThirtySecond: return MusicFontSymbol.FooterDownThirtySecond;
                    case Duration.SixtyFourth: return MusicFontSymbol.FooterDownSixtyFourth;
                    default: return MusicFontSymbol.FooterDownEighth;
                }
            }

        }

    }
}
