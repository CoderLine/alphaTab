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
    public class BarSeperatorGlyph : Glyph
    {
        private readonly bool _isLast;

        public BarSeperatorGlyph(float x, float y, bool isLast = false)
            : base(x, y)
        {
            _isLast = isLast;
        }

        public override void DoLayout()
        {
            Width = (_isLast ? 8 : 1) * Scale;
        }

        public override bool CanScale
        {
            get { return false; }
        }

        public override void Paint(float cx, float cy, ICanvas canvas)
        {
            var blockWidth = 4 * Scale;

            var top = cy + Y + Renderer.TopPadding;
            var bottom = cy + Y + Renderer.Height - Renderer.BottomPadding;
            var left = (int)(cx + X);
            var h = bottom - top;

            // line
            canvas.BeginPath();
            canvas.MoveTo(left, top);
            canvas.LineTo(left, bottom);
            canvas.Stroke();

            if (_isLast)
            {
                // big bar
                left += (int)((3 * Scale) + 0.5f);
                canvas.FillRect(left, top, blockWidth, h);
            }
        }
    }
}
