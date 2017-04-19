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

namespace AlphaTab.Rendering.Glyphs
{
    public class TrillGlyph : EffectGlyph
    {

        public TrillGlyph(float x, float y)
            : base(x, y)
        {
        }

        public override void DoLayout()
        {
            base.DoLayout();
            Height = 20*Scale;
        }

        public override void Paint(float cx, float cy, ICanvas canvas)
        {
            var res = Renderer.Resources;

            canvas.Font = res.MarkerFont;

            var textw = canvas.MeasureText("tr");
            canvas.FillText("tr", cx + X, cy + Y + canvas.Font.Size / 2);

            var startX = textw + 3 * Scale;
            var endX = Width - startX;
            var waveScale = 1.2f;
            var step = 11 * Scale * waveScale;
            var loops = Math.Max(1, ((endX - startX) / step));


            var loopX = startX;
            var loopY = cy + Y + Height;
            for (var i = 0; i < loops; i++)
            {
                canvas.FillMusicFontSymbol(cx + X + loopX, loopY, waveScale, MusicFontSymbol.WaveHorizontal);
                loopX += step;
            }
        }
    }
}
