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
using AlphaTab.Platform;

namespace AlphaTab.Rendering.Glyphs
{
    public class TrillGlyph : EffectGlyph
    {
        private readonly float _scale;

        public TrillGlyph(float x, float y, float scale = 0.9f)
            : base(x, y)
        {
            _scale = scale;
        }

        public override void Paint(float cx, float cy, ICanvas canvas)
        {
            var res = Renderer.Resources;

            canvas.Font = res.MarkerFont;

            var textw = canvas.MeasureText("tr");
            canvas.FillText("tr", cx + X, cy + Y);

            var startX = textw;
            var endX = Width - startX;
            var step = 11 * Scale * _scale;
            var loops = Math.Max(1, ((endX - startX) / step));

            var loopX = startX;
            for (var i = 0; i < loops; i++)
            {
                canvas.FillMusicFontSymbol(cx + X + loopX, cy + Y, _scale, MusicFontSymbol.WaveHorizontal);
                loopX += step;
            }
        }
    }
}
