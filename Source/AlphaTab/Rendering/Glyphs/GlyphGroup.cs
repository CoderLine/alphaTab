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
using AlphaTab.Collections;
using AlphaTab.Platform;

namespace AlphaTab.Rendering.Glyphs
{
    /// <summary>
    /// This glyph allows to group several other glyphs to be
    /// drawn at the same x position
    /// </summary>
    public class GlyphGroup : Glyph
    {
        protected FastList<Glyph> Glyphs;

        public GlyphGroup(float x, float y)
            : base(x, y)
        {
        }

        public override void DoLayout()
        {
            if (Glyphs == null || Glyphs.Count == 0)
            {
                Width = 0;
                return;
            }

            var w = 0f;
            for (int i = 0, j = Glyphs.Count; i < j; i++)
            {
                var g = Glyphs[i];
                g.Renderer = Renderer;
                g.DoLayout();
                w = Math.Max(w, g.Width);
            }
            Width = w;
        }

        public virtual void AddGlyph(Glyph g)
        {
            if (Glyphs == null) Glyphs = new FastList<Glyph>();
            Glyphs.Add(g);
        }

        public override void Paint(float cx, float cy, ICanvas canvas)
        {
            if (Glyphs == null || Glyphs.Count == 0) return;
            for (int i = 0, j = Glyphs.Count; i < j; i++)
            {
                var g = Glyphs[i];
                g.Renderer = Renderer;
                g.Paint(cx + X, cy + Y, canvas);
            }
        }
    }
}
