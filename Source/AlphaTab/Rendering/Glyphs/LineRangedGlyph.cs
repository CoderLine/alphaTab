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
using AlphaTab.Platform;
using AlphaTab.Platform.Model;

namespace AlphaTab.Rendering.Glyphs
{
    public class LineRangedGlyph : GroupedEffectGlyph
    {
        private const float LineSpacing = 3;
        private const float LineTopPadding = 8;
        private const float LineTopOffset = 6;
        private const float LineSize = 8;
        private readonly string _label;

        public LineRangedGlyph(string label)
            : base(BeatXPosition.PostNotes)
        {
            _label = label;
        }

        public override void DoLayout()
        {
            base.DoLayout();
            Height = Renderer.Resources.EffectFont.Size;
        }

        protected override void PaintNonGrouped(float cx, float cy, ICanvas canvas)
        {
            var res = Renderer.Resources;
            canvas.Font = res.EffectFont;
            canvas.TextAlign = TextAlign.Left;
            canvas.FillText(_label, cx + X, cy + Y);
        }

        protected override void PaintGrouped(float cx, float cy, float endX, ICanvas canvas)
        {
            PaintNonGrouped(cx, cy, canvas);

            var lineSpacing = LineSpacing * Scale;
            var textWidth = canvas.MeasureText(_label);
            var startX = cx + X + textWidth + lineSpacing;
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
