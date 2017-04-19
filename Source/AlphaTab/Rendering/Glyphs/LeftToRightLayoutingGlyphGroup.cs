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
using AlphaTab.Collections;

namespace AlphaTab.Rendering.Glyphs
{
    public class LeftToRightLayoutingGlyphGroup : GlyphGroup
    {
        public LeftToRightLayoutingGlyphGroup()
            : base(0,0)
        {
            Glyphs = new FastList<Glyph>();
        }

        public override void AddGlyph(Glyph g)
        {
            g.X = Glyphs.Count == 0 
                ? 0 
                : (Glyphs[Glyphs.Count - 1].X + Glyphs[Glyphs.Count - 1].Width);
            g.Renderer = Renderer;
            g.DoLayout();
            Width = g.X + g.Width;
            base.AddGlyph(g);
        }
    }
}