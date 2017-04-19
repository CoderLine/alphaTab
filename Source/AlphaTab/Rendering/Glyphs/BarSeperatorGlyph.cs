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
using AlphaTab.Rendering.Effects;

namespace AlphaTab.Rendering.Glyphs
{
    public class BarSeperatorGlyph : Glyph
    {
        public BarSeperatorGlyph(float x, float y)
            : base(x, y)
        {
        }

        public override void DoLayout()
        {
            Width = 8 * Scale;
        }

        public override void Paint(float cx, float cy, ICanvas canvas)
        {
            var blockWidth = 4 * Scale;

            var top = cy + Y + Renderer.TopPadding;
            var bottom = cy + Y + Renderer.Height - Renderer.BottomPadding;
            var left = (int)(cx + X);
            var h = bottom - top;

            if (Renderer.IsLast)
            {
                // small bar
                canvas.FillRect(left, top, Scale, h);
                // big bar
                canvas.FillRect(left + Width - blockWidth, top, blockWidth, h);
            }
            else
            {
                // small bar
                canvas.FillRect(left + Width, top, Scale, h);
                if (Renderer.Bar.MasterBar.IsDoubleBar)
                {
                    canvas.FillRect(left + Width - 5 * Scale, top, Scale, h);
                }
            }
        }
    }
}