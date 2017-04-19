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
using AlphaTab.Platform;

namespace AlphaTab.Rendering.Glyphs
{
    public class BarNumberGlyph : Glyph
    {
        private readonly int _number;

        public BarNumberGlyph(float x, float y, int number)
            : base(x, y)
        {
            _number = number;
        }

        public override void DoLayout()
        {
            Renderer.ScoreRenderer.Canvas.Font = Renderer.Resources.BarNumberFont;
            Width = Renderer.ScoreRenderer.Canvas.MeasureText(_number.ToString()) + 5 * Scale;
        }

        public override void Paint(float cx, float cy, ICanvas canvas)
        {
            if (!Renderer.Staff.IsFirstInAccolade)
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
