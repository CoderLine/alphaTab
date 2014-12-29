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
    public class BendGlyph : Glyph
    {
        private readonly Note _note;
        private readonly float _height;

        public BendGlyph(Note n, float width, float height)
            : base(0, 0)
        {
            _note = n;
            Width = width;
            _height = height;
        }

        public override void Paint(float cx, float cy, ICanvas canvas)
        {
            var r = (TabBarRenderer)Renderer;
            var res = Renderer.Resources;
            // calculate offsets per step
            var dX = Width / BendPoint.MaxPosition;
            var maxValue = 0;
            for (int i = 0, j = _note.BendPoints.Count; i < j; i++)
            {
                if (_note.BendPoints[i].Value > maxValue)
                {
                    maxValue = _note.BendPoints[i].Value;
                }
            }

            var dY = maxValue == 0 ? 0 : _height / maxValue;

            var xx = cx + X;
            var yy = cy + Y + r.GetNoteY(_note);

            canvas.BeginPath();
            for (int i = 0, j = _note.BendPoints.Count - 1; i < j; i++)
            {
                var firstPt = _note.BendPoints[i];
                var secondPt = _note.BendPoints[i + 1];

                // don't draw a line if there's no offset and it's the last point
                if (firstPt.Value == secondPt.Value && i == _note.BendPoints.Count - 2) continue;

                var x1 = xx + (dX * firstPt.Offset);
                var y1 = yy - (dY * firstPt.Value);
                var x2 = xx + (dX * secondPt.Offset);
                var y2 = yy - (dY * secondPt.Value);

                if (firstPt.Value == secondPt.Value)
                {
                    // draw horizontal line
                    canvas.MoveTo(x1, y1);
                    canvas.LineTo(x2, y2);
                    canvas.Stroke();
                }
                else
                {
                    // draw bezier lien from first to second point
                    var hx = x1 + (x2 - x1);
                    var hy = yy - (dY * firstPt.Value);
                    canvas.MoveTo(x1, y1);
                    canvas.BezierCurveTo(hx, hy, x2, y2, x2, y2);
                    canvas.Stroke();
                }



                // what type of arrow? (up/down)
                var arrowSize = 6 * Scale;
                if (secondPt.Value > firstPt.Value)
                {
                    canvas.BeginPath();
                    canvas.MoveTo(x2, y2);
                    canvas.LineTo(x2 - arrowSize * 0.5f, y2 + arrowSize);
                    canvas.LineTo(x2 + arrowSize * 0.5f, y2 + arrowSize);
                    canvas.ClosePath();
                    canvas.Fill();
                }
                else if (secondPt.Value != firstPt.Value)
                {
                    canvas.BeginPath();
                    canvas.MoveTo(x2, y2);
                    canvas.LineTo(x2 - arrowSize * 0.5f, y2 - arrowSize);
                    canvas.LineTo(x2 + arrowSize * 0.5f, y2 - arrowSize);
                    canvas.ClosePath();
                    canvas.Fill();
                }
                canvas.Stroke();

                if (secondPt.Value != 0)
                {
                    var dV = (secondPt.Value - firstPt.Value);
                    var up = dV > 0;
                    dV = Math.Abs(dV);

                    // calculate label
                    var s = "";
                    // Full Steps
                    if (dV == 4)
                    {
                        s = "full";
                        dV -= 4;
                    }
                    else if (dV > 4)
                    {
                        s += dV / 4 + " ";
                        // Quaters
                        dV -= dV / 4;
                    }

                    if (dV > 0)
                    {
                        s += dV + "/4";
                    }

                    if (s != "")
                    {
                        if (!up)
                        {
                            s = "-" + s;
                        }

                        // draw label
                        canvas.Font = res.TablatureFont;
                        var size = canvas.MeasureText(s);
                        var y = up ? y2 - res.TablatureFont.Size - (2 * Scale) : y2 + (2 * Scale);
                        var x = x2 - size / 2;

                        canvas.FillText(s, x, y);
                    }
                }
            }
        }
    }
}
