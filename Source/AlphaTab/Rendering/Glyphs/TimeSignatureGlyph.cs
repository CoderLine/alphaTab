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
    public class TimeSignatureGlyph : GlyphGroup
    {
        private readonly int _numerator;
        private readonly int _denominator;

        public TimeSignatureGlyph(float x, float y, int numerator, int denominator)
            : base(x, y)
        {
            _numerator = numerator;
            _denominator = denominator;
        }

        public override bool CanScale
        {
            get { return false; }
        }

        public override void DoLayout()
        {
            var numerator = new NumberGlyph(0, 0, _numerator);
            var denominator = new NumberGlyph(0, 18 * Scale, _denominator);

            AddGlyph(numerator);
            AddGlyph(denominator);

            base.DoLayout();

            for (int i = 0, j = Glyphs.Count; i < j; i++)
            {
                var g = Glyphs[i];
                g.X = (Width - g.Width) / 2;
            }
        }
    }
}
