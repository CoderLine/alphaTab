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
using AlphaTab.Platform;

namespace AlphaTab.Rendering.Glyphs
{
    class CrescendoGlyph : GroupedEffectGlyph
    {
        private const int Padding = NoteHeadGlyph.QuarterNoteHeadWidth / 2;
        private readonly CrescendoType _crescendo;

        public CrescendoGlyph(float x, float y, CrescendoType crescendo)
            : base(BeatXPosition.EndBeat)
        {
            _crescendo = crescendo;
            X = x;
            Y = y;
        }

        public override void DoLayout()
        {
            base.DoLayout();
            Height = 17*Scale;
        }

        protected override void PaintGrouped(float cx, float cy, float endX, ICanvas canvas)
        {
            var startX = cx + X;
            var height = Height * Scale;
            canvas.BeginPath();
            if (_crescendo == CrescendoType.Crescendo)
            {
                endX -= Padding * Scale;
                canvas.MoveTo(endX, cy + Y);
                canvas.LineTo(startX, cy + Y + height / 2);
                canvas.LineTo(endX, cy + Y + height);
            }
            else
            {
                endX -= Padding * Scale;
                canvas.MoveTo(startX, cy + Y);
                canvas.LineTo(endX, cy + Y + (height / 2));
                canvas.LineTo(startX, cy + Y + height);
            }
            canvas.Stroke();
        }
    }
}
