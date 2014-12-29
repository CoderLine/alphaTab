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
using AlphaTab.Platform;

namespace AlphaTab.Rendering.Glyphs
{
    public class BarNumberGlyph : Glyph
    {
        private readonly int _number;
        private readonly bool _hidden;

        public BarNumberGlyph(float x, float y, int number, bool hidden)
            : base(x, y)
        {
            _number = number;
            _hidden = hidden;
        }

        public override void DoLayout()
        {
            Width = 10 * Scale;
        }

        public override bool CanScale
        {
            get { return false; }
        }

        public override void Paint(float cx, float cy, ICanvas canvas)
        {
            if (_hidden)
            {
                return;
            }
            var res = Renderer.Resources;
            canvas.Color = res.BarNumberColor;
            canvas.Font = res.BarNumberFont;

            canvas.FillText(_number.ToString(), cx + X, cy + Y);

            canvas.Color = res.MainGlyphColor;
        }
    }
}
