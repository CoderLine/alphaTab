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
using AlphaTab.Platform.Model;

namespace AlphaTab.Rendering.Glyphs
{
    public class TextGlyph : EffectGlyph
    {
        private readonly string _text;
        private readonly Font _font;
        private readonly TextAlign _textAlign;

        public TextGlyph(float x, float y, string text, Font font, TextAlign textAlign = TextAlign.Left)
            : base(x, y)
        {
            _text = text;
            _font = font;
            _textAlign = textAlign;
        }

        public override void Paint(float cx, float cy, ICanvas canvas)
        {
            canvas.Font = _font;
            var old = canvas.TextAlign;
            canvas.TextAlign = _textAlign;
            canvas.FillText(_text, cx + X, cy + Y);
            canvas.TextAlign = old;
        }
    }
}
