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
using AlphaTab.Model;
using AlphaTab.Platform;

namespace AlphaTab.Rendering.Glyphs
{
    public class CrescendoGlyph : EffectGlyph
    {
        public const float Height = 17;

        private readonly CrescendoType _crescendo;

        public CrescendoGlyph(float x, float y, CrescendoType crescendo)
            : base(x, y)
        {
            _crescendo = crescendo;
        }

        public override void Paint(float cx, float cy, ICanvas canvas)
        {
            var height = Height * Scale;
            canvas.BeginPath();
            if (_crescendo == CrescendoType.Crescendo)
            {
                canvas.MoveTo(cx + X + Width, cy + Y);
                canvas.LineTo(cx + X, cy + Y + (height / 2));
                canvas.LineTo(cx + X + Width, cy + Y + height);
            }
            else
            {
                canvas.MoveTo(cx + X, cy + Y);
                canvas.LineTo(cx + X + Width, cy + Y + (height / 2));
                canvas.LineTo(cx + X, cy + Y + height);
            }
            canvas.Stroke();
        }
    }
}
