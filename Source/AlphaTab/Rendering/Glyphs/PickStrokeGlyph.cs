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
using AlphaTab.Platform;

namespace AlphaTab.Rendering.Glyphs
{
    public class PickStrokeGlyph : MusicFontGlyph
    {
        public PickStrokeGlyph(float x, float y, PickStrokeType pickStroke)
            : base(x, y, 0.75f, GetSymbol(pickStroke))
        {
        }

        public override void DoLayout()
        {
            Width = 9 * Scale;
            Height = 10 * Scale;
        }

        public override void Paint(float cx, float cy, ICanvas canvas)
        {
            base.Paint(cx, cy + Height, canvas);
        }

        private static MusicFontSymbol GetSymbol(PickStrokeType pickStroke)
        {
            switch (pickStroke)
            {
                case PickStrokeType.Up: return MusicFontSymbol.PickStrokeUp;
                case PickStrokeType.Down: return MusicFontSymbol.PickStrokeDown;
                default: return MusicFontSymbol.None;
            }
        }
    }
}
