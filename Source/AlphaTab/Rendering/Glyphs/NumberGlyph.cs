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
namespace AlphaTab.Rendering.Glyphs
{
    public class NumberGlyph : GlyphGroup
    {
        private readonly int _number;

        public NumberGlyph(float x, float y, int number)
            : base(x, y)
        {
            _number = number;
        }

        public override bool CanScale
        {
            get { return false; }
        }

        public override void DoLayout()
        {
            var i = _number;
            while (i > 0)
            {
                var num = i % 10;
                var gl = new DigitGlyph(0, 0, num);
                AddGlyph(gl);
                i = i / 10;
            }
            Glyphs.Reverse();

            var cx = 0f;
            for (int j = 0, k = Glyphs.Count; j < k; j++)
            {
                var g = Glyphs[j];
                g.X = cx;
                g.Y = 0;
                g.Renderer = Renderer;
                g.DoLayout();
                cx += g.Width;
            }
            Width = cx;
        }
    }
}
