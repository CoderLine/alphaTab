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
    public class ScoreBrushGlyph : Glyph
    {
        private readonly Beat _beat;

        public ScoreBrushGlyph(Beat beat)
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
            var scoreBarRenderer = (ScoreBarRenderer)Renderer;
            var lineSize = scoreBarRenderer.LineOffset;
            var topY = cy + Y + scoreBarRenderer.GetNoteY(_beat.MaxNote);
            var bottomY = cy + Y + scoreBarRenderer.GetNoteY(_beat.MinNote) + lineSize;
            var arrowX = cx + X + Width / 2;
            var arrowSize = 8 * Scale;

            if (_beat.BrushType == BrushType.ArpeggioUp || _beat.BrushType == BrushType.ArpeggioDown)
            {
                var size = 14 * Scale;
                var waveTop = topY;
                var waveBottom = bottomY;

                if (_beat.BrushType == BrushType.ArpeggioUp)
                {
                    waveTop -= lineSize;
                    waveBottom -= arrowSize;
                    var steps = Math.Floor((waveBottom - waveTop) / size);
                    for (var i = 0; i < steps; i++)
                    {
                        canvas.FillMusicFontSymbol(cx + X + (2 * Scale), waveBottom - ((i + 1) * size), 1, MusicFontSymbol.WaveVertical);
                    }
                }
                else
                {
                    waveTop += arrowSize;
                    waveBottom += lineSize;
                    var steps = Math.Floor((waveBottom - waveTop) / size);
                    for (var i = 0; i < steps; i++)
                    {
                        canvas.FillMusicFontSymbol(cx + X + (2 * Scale), waveTop + (i * size), 1, MusicFontSymbol.WaveVertical);
                    }
                }

                if (_beat.BrushType == BrushType.ArpeggioUp)
                {
                    canvas.BeginPath();
                    canvas.MoveTo(arrowX, bottomY);
                    canvas.LineTo(arrowX + arrowSize / 2, bottomY - arrowSize);
                    canvas.LineTo(arrowX - arrowSize / 2, bottomY - arrowSize);
                    canvas.ClosePath();
                    canvas.Fill();
                }
                else if (_beat.BrushType == BrushType.ArpeggioDown)
                {
                    canvas.BeginPath();
                    canvas.MoveTo(arrowX, topY);
                    canvas.LineTo(arrowX + arrowSize / 2, topY + arrowSize);
                    canvas.LineTo(arrowX - arrowSize / 2, topY + arrowSize);
                    canvas.ClosePath();
                    canvas.Fill();
                }
            }
        }
    }
}
