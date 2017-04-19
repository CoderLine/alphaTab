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

namespace AlphaTab.Rendering.Glyphs
{
    public class NoteHeadGlyph : MusicFontGlyph
    {
        public const float GraceScale = 0.75f;
        public const float NoteHeadHeight = 9;

        private readonly bool _isGrace;
        private readonly Duration _duration;

        public NoteHeadGlyph(float x, float y, Duration duration, bool isGrace)
            : base(x, y, isGrace ? GraceScale : 1, GetSymbol(duration))
        {
            _isGrace = isGrace;
            _duration = duration;
        }

        public override void DoLayout()
        {
            switch (_duration)
            {
                case Duration.QuadrupleWhole:
                    Width = 14 * (_isGrace ? GraceScale : 1) * Scale;
                    break;
                case Duration.DoubleWhole:
                    Width = 14 * (_isGrace ? GraceScale : 1) * Scale;
                    break;
                case Duration.Whole:
                    Width = 14 * (_isGrace ? GraceScale : 1) * Scale;
                    break;
                default:
                    Width = 9 * (_isGrace ? GraceScale : 1) * Scale;
                    break;
            }
        }

        private static MusicFontSymbol GetSymbol(Duration duration)
        {
            switch (duration)
            {
                case Duration.QuadrupleWhole:
                    return MusicFontSymbol.NoteQuadrupleWhole;
                case Duration.DoubleWhole:
                    return MusicFontSymbol.NoteDoubleWhole;
                case Duration.Whole:
                    return MusicFontSymbol.NoteWhole;
                case Duration.Half:
                    return MusicFontSymbol.NoteHalf;
                default:
                    return MusicFontSymbol.NoteQuarter;
            }
        }
    }
}