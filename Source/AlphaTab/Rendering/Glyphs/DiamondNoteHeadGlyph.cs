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

using AlphaTab.Model;

namespace AlphaTab.Rendering.Glyphs
{
    class DiamondNoteHeadGlyph : MusicFontGlyph
    {
        private readonly bool _isGrace;

        public DiamondNoteHeadGlyph(float x, float y, Duration duration, bool isGrace)
            : base(x, y, isGrace ? NoteHeadGlyph.GraceScale : 1, GetSymbol(duration))
        {
            _isGrace = isGrace;
        }

        private static MusicFontSymbol GetSymbol(Duration duration)
        {
            switch (duration)
            {
                case Duration.QuadrupleWhole:
                case Duration.DoubleWhole:
                case Duration.Whole:
                case Duration.Half:
                    return MusicFontSymbol.NoteHarmonicWhole;
                default:
                    return MusicFontSymbol.NoteHarmonic;
            }
        }

        public override void DoLayout()
        {
            Width = 9 * (_isGrace ? NoteHeadGlyph.GraceScale : 1) * Scale;
        }
    }
}
