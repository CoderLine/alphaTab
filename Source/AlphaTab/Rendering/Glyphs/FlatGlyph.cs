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

using System;
using AlphaTab.Model;

namespace AlphaTab.Rendering.Glyphs
{
    public class AccidentalGlyph : MusicFontGlyph
    {
        private readonly bool _isGrace;

        public AccidentalGlyph(float x, float y, AccidentalType accidentalType, bool isGrace = false)
            : base(x, y, isGrace ? NoteHeadGlyph.GraceScale : 1,GetMusicSymbol(accidentalType))
        {
            _isGrace = isGrace;
        }

        private static MusicFontSymbol GetMusicSymbol(AccidentalType accidentalType)
        {
            switch (accidentalType)
            {
                case AccidentalType.Natural:
                    return MusicFontSymbol.AccidentalNatural;
                case AccidentalType.Sharp:
                    return MusicFontSymbol.AccidentalSharp;
                case AccidentalType.Flat:
                    return MusicFontSymbol.AccidentalFlat;
                case AccidentalType.NaturalQuarterNoteUp:
                    return MusicFontSymbol.AccidentalQuarterToneNaturalArrowUp;
                case AccidentalType.SharpQuarterNoteUp:
                    return MusicFontSymbol.AccidentalQuarterToneSharpArrowUp;
                case AccidentalType.FlatQuarterNoteUp:
                    return MusicFontSymbol.AccidentalQuarterToneFlatArrowUp;
            }
            return MusicFontSymbol.None;
        }

        public override void DoLayout()
        {
            Width = 8 * (_isGrace ? NoteHeadGlyph.GraceScale : 1) * Scale;
        }
    }
}
