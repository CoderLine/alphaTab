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
using System;
using AlphaTab.Model;
using AlphaTab.Platform;
using AlphaTab.Platform.Model;

namespace AlphaTab.Rendering.Glyphs
{
    public class LineRangedGlyph : EffectGlyph
    {
        private const float LineSpacing = 3;
        private const float LineTopPadding = 8;
        private const float LineTopOffset = 6;
        private const float LineSize = 8;
        private bool _isExpanded;
        private readonly string _label;

        public LineRangedGlyph(float x, float y, string label)
            : base(x, y)
        {
            _label = label;
        }

        public override void ExpandTo(Beat beat)
        {
            _isExpanded = true;
        }

        public override void Paint(float cx, float cy, ICanvas canvas)
        {
            var res = Renderer.Resources;
            canvas.Font = res.EffectFont;
            canvas.TextAlign = TextAlign.Left;
            var textWidth = canvas.MeasureText(_label);
            canvas.FillText(_label, cx + X, cy + Y);

            // check if we need lines
            if (_isExpanded)
            {
                var lineSpacing = LineSpacing * Scale;
                var startX = cx + X + textWidth + lineSpacing;
                var endX = cx + X + Width - lineSpacing - lineSpacing;
                var lineY = cy + Y + (LineTopPadding * Scale);
                var lineSize = LineSize * Scale;

                if (endX > startX)
                {
                    var lineX = startX;
                    while (lineX < endX)
                    {
                        canvas.BeginPath();
                        canvas.MoveTo(lineX, (int)lineY);
                        canvas.LineTo(Math.Min(lineX + lineSize, endX), (int)lineY);
                        lineX += lineSize + lineSpacing;
                        canvas.Stroke();
                    }
                    canvas.BeginPath();
                    canvas.MoveTo(endX, (int)(lineY - LineTopOffset * Scale));
                    canvas.LineTo(endX, (int)(lineY + LineTopOffset * Scale));
                    canvas.Stroke();

                }
            }
        }
    }
}
