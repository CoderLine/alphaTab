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
using AlphaTab.Rendering.Glyphs;

namespace AlphaTab.Rendering.Effects
{
    public class DummyEffectGlyph : EffectGlyph
    {
        private readonly string _s;

        public DummyEffectGlyph(float x, float y, string s)
            : base(x, y)
        {
            _s = s;
        }

        public override void DoLayout()
        {
            Width = 20 * Scale;
        }

        public override bool CanScale
        {
            get { return false; }
        }

        public override void Paint(float cx, float cy, ICanvas canvas)
        {
            var res = Renderer.Resources;
            canvas.Color = res.MainGlyphColor;
            canvas.StrokeRect(cx + X, cy + Y, Width, 20 * Scale);
            canvas.Font = res.TablatureFont;
            canvas.FillText(_s, cx + X, cy + Y);
        }
    }
}
