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
using System;
using AlphaTab.Model;
using AlphaTab.Platform;

namespace AlphaTab.Rendering.Glyphs
{
    public class BendGlyph : Glyph
    {
        private readonly Note _note;
        private readonly float _bendValueHeight;

        public BendGlyph(Note n, float bendValueHeight)
            : base(0, 0)
        {
            _note = n;
            _bendValueHeight = bendValueHeight;
        }

        public override void Paint(float cx, float cy, ICanvas canvas)
        {
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

            cx += X;
            cy += Y;

            canvas.BeginPath();
            for (int i = 0, j = _note.BendPoints.Count - 1; i < j; i++)
            {
                var firstPt = _note.BendPoints[i];
                var secondPt = _note.BendPoints[i + 1];

                // draw pre-bend if previous 
                if (i == 0 && firstPt.Value != 0 && !_note.IsTieDestination)
                {
                    PaintBend(new BendPoint(), firstPt, cx, cy, dX, canvas);
                }

                // don't draw a line if there's no offset and it's the last point
                if (firstPt.Value == secondPt.Value && i == _note.BendPoints.Count - 2) continue;

                PaintBend(firstPt, secondPt,  cx, cy, dX, canvas);
            }
        }

        private void PaintBend(BendPoint firstPt, BendPoint secondPt, float cx, float cy, float dX, ICanvas canvas)
        {
            var r = (TabBarRenderer)Renderer;
            var res = Renderer.Resources;

            var overflowOffset = r.LineOffset / 2;

            var x1 = cx + (dX * firstPt.Offset);
            var y1 = cy - (_bendValueHeight * firstPt.Value);
            if (firstPt.Value == 0)
            {
                y1 += r.GetNoteY(_note);
            }
            else
            {
                y1 += overflowOffset;
            }
            var x2 = cx + (dX * secondPt.Offset);
            var y2 = cy - (_bendValueHeight * secondPt.Value);
            if (secondPt.Value == 0)
            {
                y2 += r.GetNoteY(_note);
            }
            else
            {
                y2 += overflowOffset;
            }

            // what type of arrow? (up/down)
            var arrowOffset = 0f;
            var arrowSize = 6 * Scale;
            if (secondPt.Value > firstPt.Value)
            {
                canvas.BeginPath();
                canvas.MoveTo(x2, y2);
                canvas.LineTo(x2 - arrowSize * 0.5f, y2 + arrowSize);
                canvas.LineTo(x2 + arrowSize * 0.5f, y2 + arrowSize);
                canvas.ClosePath();
                canvas.Fill();
                arrowOffset = arrowSize;
            }
            else if (secondPt.Value != firstPt.Value)
            {
                canvas.BeginPath();
                canvas.MoveTo(x2, y2);
                canvas.LineTo(x2 - arrowSize * 0.5f, y2 - arrowSize);
                canvas.LineTo(x2 + arrowSize * 0.5f, y2 - arrowSize);
                canvas.ClosePath();
                canvas.Fill();
                arrowOffset = -arrowSize;
            }
            canvas.Stroke();

            if (firstPt.Value == secondPt.Value)
            {
                // draw horizontal line
                canvas.MoveTo(x1, y1);
                canvas.LineTo(x2, y2);
                canvas.Stroke();
            }
            else
            {
                if (x2 > x1)
                {
                    // draw bezier lien from first to second point
                    canvas.MoveTo(x1, y1);
                    canvas.BezierCurveTo(x2, y1, x2, y2 + arrowOffset, x2, y2 + arrowOffset);
                    canvas.Stroke();
                }
                else
                {
                    canvas.MoveTo(x1, y1);
                    canvas.LineTo(x2, y2);
                    canvas.Stroke();
                }
            }

            if (secondPt.Value != 0)
            {
                var dV = secondPt.Value;
                var up = secondPt.Value > firstPt.Value;
                dV = Math.Abs(dV);

                // calculate label
                var s = "";
                // Full Steps
                if (dV == 4 && up)
                {
                    s = "full";
                    dV -= 4;
                }
                else if (dV >= 4 || dV <= -4)
                {
                    int steps = dV / 4;
                    s += steps;
                    // Quaters
                    dV -= steps * 4;
                }

                if (dV > 0)
                {
                    s += GetFractionSign(dV);
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

        public static string GetFractionSign(int steps)
        {
            switch (steps)
            {
                case 1:
                    return "¼";
                case 2:
                    return "½";
                case 3:
                    return "¾";
                default:
                    return steps + "/ 4";
            }
        }
    }
}
