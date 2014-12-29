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
namespace AlphaTab.Rendering.Glyphs
{
    public class DigitGlyph : MusicFontGlyph
    {
        private readonly int _digit;

        public DigitGlyph(float x, float y, int digit)
            : base(x, y, 1, GetSymbol(digit))
        {
            _digit = digit;
        }

        public override void DoLayout()
        {
            Y += 7 * Scale;
            Width = GetDigitWidth(_digit) * Scale;
        }

        private float GetDigitWidth(int digit)
        {
            switch (digit)
            {
                case 0:
                case 2:
                case 3:
                case 4:
                case 5:
                case 6:
                case 7:
                case 8:
                case 9:
                    return 14;
                case 1:
                    return 10;
                default:
                    return 0;
            }
        }

        public override bool CanScale
        {
            get { return false; }
        }

        private static MusicFontSymbol GetSymbol(int digit)
        {
            switch (digit)
            {
                case 0:
                    return MusicFontSymbol.Num0;
                case 1:
                    return MusicFontSymbol.Num1;
                case 2:
                    return MusicFontSymbol.Num2;
                case 3:
                    return MusicFontSymbol.Num3;
                case 4:
                    return MusicFontSymbol.Num4;
                case 5:
                    return MusicFontSymbol.Num5;
                case 6:
                    return MusicFontSymbol.Num6;
                case 7:
                    return MusicFontSymbol.Num7;
                case 8:
                    return MusicFontSymbol.Num8;
                case 9:
                    return MusicFontSymbol.Num9;
                default:
                    return MusicFontSymbol.None;
            }
        }
    }
}
