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
using AlphaTab.Model;
using AlphaTab.Platform;

namespace AlphaTab.Rendering.Glyphs
{
    public class TabBrushGlyph : Glyph
    {
        private readonly Beat _beat;

        public TabBrushGlyph(Beat beat)
            : base(0, 0)
        {
            _beat = beat;
        }

        public override void DoLayout()
        {
            Width = 10 * Scale;
        }

        public override void Paint(float cx, float cy, ICanvas canvas)
        {
            var tabBarRenderer = (TabBarRenderer)Renderer;
            var res = Renderer.Resources;
            var startY = cy + X + (tabBarRenderer.GetNoteY(_beat.MaxNote) - res.TablatureFont.Size / 2);
            var endY = cy + Y + tabBarRenderer.GetNoteY(_beat.MinNote) + res.TablatureFont.Size / 2;
            var arrowX = (int)(cx + X + Width / 2);
            var arrowSize = 8 * Scale;

            if (_beat.BrushType != BrushType.None)
            {
                if (_beat.BrushType == BrushType.BrushUp || _beat.BrushType == BrushType.BrushDown)
                {
                    canvas.BeginPath();
                    canvas.MoveTo(arrowX, startY);
                    canvas.LineTo(arrowX, endY);
                    canvas.Stroke();
                }
                else
                {
                    var size = 15 * Scale;
                    var steps = Math.Abs(endY - startY) / size;
                    for (var i = 0; i < steps; i++)
                    {
                        canvas.FillMusicFontSymbol(cx + X + (3 * Scale), 1, startY + (i * size), MusicFontSymbol.WaveVertical);
                    }
                }

                if (_beat.BrushType == BrushType.BrushUp || _beat.BrushType == BrushType.ArpeggioUp)
                {
                    canvas.BeginPath();
                    canvas.MoveTo(arrowX, endY);
                    canvas.LineTo(arrowX + arrowSize / 2, endY - arrowSize);
                    canvas.LineTo(arrowX - arrowSize / 2, endY - arrowSize);
                    canvas.ClosePath();
                    canvas.Fill();
                }
                else
                {
                    canvas.BeginPath();
                    canvas.MoveTo(arrowX, startY);
                    canvas.LineTo(arrowX + arrowSize / 2, startY + arrowSize);
                    canvas.LineTo(arrowX - arrowSize / 2, startY + arrowSize);
                    canvas.ClosePath();
                    canvas.Fill();
                }
            }
        }
    }
}
