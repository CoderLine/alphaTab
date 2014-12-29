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
    public class RepeatOpenGlyph : Glyph
    {
        private readonly float _dotOffset;
        private readonly float _circleSize;

        public RepeatOpenGlyph(float x, float y, float circleSize, float dotOffset)
            : base(x, y)
        {
            _dotOffset = dotOffset;
            _circleSize = circleSize;
        }

        public override void DoLayout()
        {
            Width = 13 * Scale;
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
            var left = cx + X + 0.5f;
            // big bar
            var h = bottom - top;
            canvas.FillRect(left, top, blockWidth, h);

            // line
            left += (blockWidth * 2) - 0.5f;
            canvas.BeginPath();
            canvas.MoveTo(left, top);
            canvas.LineTo(left, bottom);
            canvas.Stroke();

            //circles 
            left += 3 * Scale;

            var circleSize = _circleSize * Scale;
            var middle = (top + bottom) / 2;
            canvas.FillCircle(left, middle - (circleSize * _dotOffset), circleSize);
            canvas.FillCircle(left, middle + (circleSize * _dotOffset), circleSize);
        }
    }
}
