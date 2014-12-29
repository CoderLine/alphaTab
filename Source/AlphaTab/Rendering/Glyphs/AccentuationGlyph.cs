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
    public class AccentuationGlyph : MusicFontGlyph
    {
        public AccentuationGlyph(float x, float y, AccentuationType accentuation)
            : base(x, y, 1, GetSymbol(accentuation))
        {
        }

        private static MusicFontSymbol GetSymbol(AccentuationType accentuation)
        {
            switch (accentuation)
            {
                case AccentuationType.None:
                    return MusicFontSymbol.None;
                case AccentuationType.Normal:
                    return MusicFontSymbol.Accentuation;
                case AccentuationType.Heavy:
                    return MusicFontSymbol.HeavyAccentuation;
                default:
                    return MusicFontSymbol.None;
            }
        }

        public override void DoLayout()
        {
            Width = 9 * Scale;
        }

        public override bool CanScale
        {
            get { return false; }
        }
    }
}
