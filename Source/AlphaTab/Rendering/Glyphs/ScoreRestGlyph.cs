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
using AlphaTab.Rendering.Utils;

namespace AlphaTab.Rendering.Glyphs
{
    public class ScoreRestGlyph : MusicFontGlyph
    {
        private readonly Duration _duration;

        public BeamingHelper BeamingHelper { get; set; }

        public ScoreRestGlyph(float x, float y, Duration duration)
            : base(x, y, 1, GetSymbol(duration))
        {
            _duration = duration;
        }

        public static MusicFontSymbol GetSymbol(Duration duration)
        {
            switch (duration)
            {
                case Duration.QuadrupleWhole:
                    return MusicFontSymbol.RestQuadrupleWhole;
                case Duration.DoubleWhole:
                    return MusicFontSymbol.RestDoubleWhole;
                case Duration.Whole:
                    return MusicFontSymbol.RestWhole;
                case Duration.Half:
                    return MusicFontSymbol.RestHalf;
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
                case Duration.OneHundredTwentyEighth:
                    return MusicFontSymbol.RestOneHundredTwentyEighth;
                case Duration.TwoHundredFiftySixth:
                    return MusicFontSymbol.RestTwoHundredFiftySixth;
                default:
                    return MusicFontSymbol.None;
            }
        }
        public static float GetSize(Duration duration)
        {
            switch (duration)
            {
                case Duration.QuadrupleWhole:
                case Duration.DoubleWhole:
                case Duration.Whole:
                case Duration.Half:
                case Duration.Quarter:
                case Duration.Eighth:
                case Duration.Sixteenth:
                    return 9;
                case Duration.ThirtySecond:
                    return 12;
                case Duration.SixtyFourth:
                    return 14;
                case Duration.OneHundredTwentyEighth:
                case Duration.TwoHundredFiftySixth:
                    return 20;
            }

            return 10;
        }

        public override void DoLayout()
        {
            Width = GetSize(_duration) * Scale;
        }

        public void UpdateBeamingHelper(float cx)
        {
            if (BeamingHelper != null)
            {
                BeamingHelper.RegisterBeatLineX(ScoreBarRenderer.StaffId, Beat, cx + X + Width / 2, cx + X + Width / 2);
            }
        }
    }
}
