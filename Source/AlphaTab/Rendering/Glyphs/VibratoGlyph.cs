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
    public class VibratoGlyph : GroupedEffectGlyph
    {
        private readonly float _scale;

        public VibratoGlyph(float x, float y, float scale = 1.2f)
            : base(BeatXPosition.EndBeat)
        {
            _scale = scale;
            X = x;
            Y = y;
        }

        public override void DoLayout()
        {
            base.DoLayout();
            Height = 10 * Scale * _scale;
        }

        protected override void PaintGrouped(float cx, float cy, float endX, ICanvas canvas)
        {
            var startX = cx + X;
            var width = endX - startX;
            var step = 9 * Scale * _scale;
            var loops = (int)Math.Max(1, width / step);
            var h = Height;

            var loopX = 0f;
            for (var i = 0; i < loops; i++)
            {
                canvas.FillMusicFontSymbol(cx + X + loopX, cy + Y + h, _scale, MusicFontSymbol.WaveHorizontal);
                loopX += step;
            }
        }
    }
}
