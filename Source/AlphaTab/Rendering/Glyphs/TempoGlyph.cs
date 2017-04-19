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
using AlphaTab.Platform;

namespace AlphaTab.Rendering.Glyphs
{
    public class TempoGlyph : EffectGlyph
    {
        private readonly int _tempo;

        public TempoGlyph(float x, float y, int tempo)
            : base(x, y)
        {
            _tempo = tempo;
        }

        public override void DoLayout()
        {
            base.DoLayout();
            Height = 25 * Scale;
        }

        public override void Paint(float cx, float cy, ICanvas canvas)
        {
            var res = Renderer.Resources;
            canvas.Font = res.MarkerFont;

            canvas.FillMusicFontSymbol(cx + X, cy + Y + Height * 0.8f, 0.75f, MusicFontSymbol.Tempo);
            canvas.FillText("= " + _tempo, cx + X + (Height / 2), cy + Y + canvas.Font.Size / 2);
        }
    }
}
