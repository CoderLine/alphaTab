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
using AlphaTab.Model;
using AlphaTab.Platform;

namespace AlphaTab.Rendering.Glyphs
{
    public class NoteNumberGlyph : Glyph
    {
        private readonly string _noteString;
        private readonly bool _isGrace;

        public NoteNumberGlyph(float x, float y, Note n, bool isGrace)
            : base(x, y)
        {
            _isGrace = isGrace;
            if (!n.IsTieDestination)
            {
                _noteString = n.IsDead ? "X" : n.Fret.ToString();
                if (n.IsGhost)
                {
                    _noteString = "(" + _noteString + ")";
                }
            }
            else if (n.Beat.Index == 0)
            {
                _noteString = "(" + n.TieOrigin.Fret + ")";
            }
            else
            {
                _noteString = "";
            }
        }

        public override void DoLayout()
        {
            Width = 10 * Scale;
        }

        public void CalculateWidth()
        {
            Width = Renderer.Layout.Renderer.Canvas.MeasureText(_noteString);
        }

        public override void Paint(float cx, float cy, ICanvas canvas)
        {
            if (_noteString != null)
            {
                canvas.FillText(_noteString.ToLower(), cx + X, cy + Y);
            }
        }
    }
}
