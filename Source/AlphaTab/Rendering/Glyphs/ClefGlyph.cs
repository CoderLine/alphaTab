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

using System;
using AlphaTab.Model;
using AlphaTab.Platform;

namespace AlphaTab.Rendering.Glyphs
{
    public class ClefGlyph : MusicFontGlyph
    {
        private readonly Clef _clef;
        private readonly ClefOttavia _clefOttavia;

        public ClefGlyph(float x, float y, Clef clef, ClefOttavia clefOttavia)
            : base(x, y, 1, GetSymbol(clef))
        {
            _clef = clef;
            _clefOttavia = clefOttavia;
        }

        public override void DoLayout()
        {
            switch (_clef)
            {
                case Clef.Neutral:
                    Width = 15 * Scale;
                    break;
                case Clef.C3:
                case Clef.C4:
                case Clef.F4:
                case Clef.G2:
                    Width = 28 * Scale;
                    break;
            }
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

        public override void Paint(float cx, float cy, ICanvas canvas)
        {
            base.Paint(cx, cy, canvas);
            NumberGlyph numberGlyph;
            bool top = false;
            switch (_clefOttavia)
            {
                case ClefOttavia._15ma:
                    numberGlyph = new NumberGlyph(Width/2, 0, 15, 0.5f);
                    top = true;
                    break;
                case ClefOttavia._8va:
                    numberGlyph = new NumberGlyph(0, 0, 8, 0.5f);
                    top = true;
                    break;
                case ClefOttavia._8vb:
                    numberGlyph = new NumberGlyph(0, 0, 8, 0.5f);
                    break;
                case ClefOttavia._15mb:
                    numberGlyph = new NumberGlyph(0, 0, 15, 0.5f);
                    break;
                default:
                    return;
            }

            int offset;

            switch (_clef)
            {
                case Clef.Neutral:
                    offset = top ? -25 : 10;
                    break;
                case Clef.C3:
                    offset = top ? -30 : 20;
                    break;
                case Clef.C4:
                    offset = top ? -30 : 20;
                    break;
                case Clef.F4:
                    offset = top ? -25 : 20;
                    break;
                case Clef.G2:
                    offset = top ? -50 : 25;
                    break;
                default:
                    return;
            }

            numberGlyph.Renderer = Renderer;
            numberGlyph.DoLayout();

            var x = (Width - numberGlyph.Width)/2;

            numberGlyph.Paint(cx + X + x, cy + Y + offset*Scale, canvas);
        }
    }
}
