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
    public class RestGlyph : MusicFontGlyph
    {
        private readonly Duration _duration;

        public RestGlyph(float x, float y, Duration duration)
            : base(x, y, 1, GetSymbol(duration))
        {
            _duration = duration;
        }

        private static MusicFontSymbol GetSymbol(Duration duration)
        {
            switch (duration)
            {
                case Duration.Whole:
                case Duration.Half:
                    return MusicFontSymbol.RestWhole;
                case Duration.Quarter:
                    return MusicFontSymbol.RestQuarter;
                case Duration.Eighth:
                    return MusicFontSymbol.RestEighth;
                case Duration.Sixteenth:
                    return MusicFontSymbol.RestSixteenth;
                case Duration.ThirtySecond:
                    return MusicFontSymbol.RestThirtySecond;
                case Duration.SixtyFourth:
                    return MusicFontSymbol.RestSixtyFourth;
                default:
                    return MusicFontSymbol.None;
            }
        }

        public override void DoLayout()
        {
            switch (_duration)
            {
                case Duration.Whole:
                case Duration.Half:
                case Duration.Quarter:
                case Duration.Eighth:
                case Duration.Sixteenth:
                    Width = 9 * Scale;
                    break;
                case Duration.ThirtySecond:
                    Width = 12 * Scale;
                    break;
                case Duration.SixtyFourth:
                    Width = 14 * Scale;
                    break;
            }
        }

        public override bool CanScale
        {
            get { return false; }
        }
    }
}
