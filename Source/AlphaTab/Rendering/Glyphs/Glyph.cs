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
using System.Runtime.CompilerServices;
using AlphaTab.Platform;

namespace AlphaTab.Rendering.Glyphs
{
    /// <summary>
    /// A glyph is a single symbol which can be added to a GlyphBarRenderer for automated
    /// layouting and drawing of stacked symbols.
    /// </summary>
    public class Glyph
    {
        public int Index { get; set; }
        public int X { get; set; }
        public int Y { get; set; }
        public int Width { get; set; }
        public BarRendererBase Renderer { get; set; }

        public Glyph(int x, int y)
        {
            X = x;
            Y = y;
        }

        public virtual void ApplyGlyphSpacing(int spacing)
        {
            if (CanScale)
            {
                Width += spacing;
            }
        }

        public virtual bool CanScale
        {
            get
            {
                return true;
            }
        }

        public float Scale
        {
            get
            {
                return Renderer.Scale;
            }
        }

        public virtual void DoLayout()
        {

        }

        public virtual void Paint(int cx, int cy, ICanvas canvas)
        {
        }
    }
}
