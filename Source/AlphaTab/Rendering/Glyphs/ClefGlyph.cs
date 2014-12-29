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
    public class ClefGlyph : MusicFontGlyph
    {
        public ClefGlyph(float x, float y, Clef clef)
            : base(x, y, 1, GetSymbol(clef))
        {
        }

        public override void DoLayout()
        {
            Width = 28 * Scale;
        }

        public override bool CanScale
        {
            get { return false; }
        }

        private static MusicFontSymbol GetSymbol(Clef clef)
        {
            switch (clef)
            {
                case Clef.Neutral:
                    return MusicFontSymbol.ClefNeutral;
                case Clef.C3:
                    return MusicFontSymbol.ClefC;
                case Clef.C4:
                    return MusicFontSymbol.ClefC;
                case Clef.F4:
                    return MusicFontSymbol.ClefF;
                case Clef.G2:
                    return MusicFontSymbol.ClefG;
                default:
                    return MusicFontSymbol.None;
            }
        }
    }
}
