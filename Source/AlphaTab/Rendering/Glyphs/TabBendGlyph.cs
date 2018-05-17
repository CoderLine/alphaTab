/*
 * This file is part of alphaTab.
 * Copyright © 2018, Daniel Kuschny and Contributors, All rights reserved.
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
using AlphaTab.Model;
using AlphaTab.Platform;
using AlphaTab.Platform.Model;

namespace AlphaTab.Rendering.Glyphs
{
    public class TabBendGlyph : Glyph
    {
        private const int ArrowSize = 6;
        private const int DashSize = 3;
        private const int BendValueHeight = 6;
        private readonly Note _note;
        private FastList<BendPoint> _renderPoints;
        private string _slurText;

        public TabBendGlyph(Note n)
            : base(0, 0)
        {
            _note = n;

            _renderPoints = CreateRenderingPoints(n);
        }

        public override void DoLayout()
        {
            base.DoLayout();

            var bendHeight = _note.MaxBendPoint.Value * BendValueHeight * Scale;
            Renderer.RegisterOverflowTop(bendHeight);

            _slurText = _note.BendStyle == BendStyle.Gradual ? "grad." : "";
        }

        private FastList<BendPoint> CreateRenderingPoints(Note note)
        {
            // advanced rendering
            if (note.BendType == BendType.Custom)
            {
                return note.BendPoints;
            }

            var renderingPoints = new FastList<BendPoint>();

            // Guitar Pro Rendering Note: 
            // Last point of bend is always at end of the note even 
            // though it might not be 100% correct from timing perspective. 

            switch (note.BendType)
            {
                case BendType.BendRelease:
                    renderingPoints.Add(new BendPoint(0, note.BendPoints[0].Value));
                    renderingPoints.Add(new BendPoint(BendPoint.MaxPosition / 2, note.BendPoints[1].Value));
                    renderingPoints.Add(new BendPoint(BendPoint.MaxPosition, note.BendPoints[3].Value));
                    break;
                case BendType.Bend:
                case BendType.Hold:
                case BendType.Prebend:
                case BendType.PrebendBend:
                case BendType.PrebendRelease:
                case BendType.Release:
                    renderingPoints.Add(new BendPoint(0, note.BendPoints[0].Value));
                    renderingPoints.Add(new BendPoint(BendPoint.MaxPosition, note.BendPoints[1].Value));
                    break;
            }

            return renderingPoints;
        }

        public override void Paint(float cx, float cy, ICanvas canvas)
        {
            var startNoteRenderer = Renderer;

            Note endNote = _note;
            bool isMultiBeatBend = false;
            BarRendererBase endNoteRenderer;
            bool endNoteHasBend = false;

            Beat endBeat = null;
            while (endNote.IsTieOrigin)
            {
                var nextNote = endNote.TieDestination;

                endNoteRenderer = Renderer.ScoreRenderer.Layout.GetRendererForBar(Renderer.Staff.StaveId, nextNote.Beat.Voice.Bar);

                if (endNoteRenderer == null || startNoteRenderer.Staff != endNoteRenderer.Staff)
                {
                    break;
                }

                endNote = nextNote;
                isMultiBeatBend = true;

                if (endNote.HasBend || !Renderer.Settings.ExtendBendArrowsOnTiedNotes)
                {
                    endNoteHasBend = true;
                    break;
                }
            }

            endBeat = endNote.Beat;
            endNoteRenderer = Renderer.ScoreRenderer.Layout.GetRendererForBar(Renderer.Staff.StaveId, endBeat.Voice.Bar);

            if (endBeat.Index == endBeat.Voice.Beats.Count - 1 && !endNote.HasBend && Renderer.Settings.ExtendBendArrowsOnTiedNotes)
            {
                endBeat = null;
            }

            float startX = 0;
            float endX = 0;

            float topY = cy + startNoteRenderer.Y;
            float bottomY = cy + startNoteRenderer.Y + startNoteRenderer.GetNoteY(_note);

            startX = cx + startNoteRenderer.X;
            if (_renderPoints[0].Value > 0 || _note.IsContinuedBend)
            {
                startX += startNoteRenderer.GetBeatX(_note.Beat, BeatXPosition.MiddleNotes);
            }
            else
            {
                startX += startNoteRenderer.GetNoteX(_note);
            }

            var endXPositionType = endNoteHasBend
                ? BeatXPosition.MiddleNotes 
                : BeatXPosition.EndBeat;

            if (endBeat == null || (endBeat.Index == endBeat.Voice.Beats.Count - 1 && !endNoteHasBend))
            {
                endX = cx + endNoteRenderer.X + endNoteRenderer.Width;
            }
            else
            {
                endX = cx + endNoteRenderer.X + endNoteRenderer.GetBeatX(endBeat, endXPositionType);
            }

            if (!isMultiBeatBend)
            {
                endX -= (ArrowSize * Scale);
                //endX -= ScoreBendGlyph.EndPadding * Scale;
            }

            // we need some pixels for the arrow. otherwise we might draw into the next 
            // note
            var width = endX - startX;

            //var bendHeight = _note.MaxBendPoint.Value * _bendValueHeight;
            //var c = new Color((byte)(Platform.Platform.RandomDouble() * 255),
            //        (byte)(Platform.Platform.RandomDouble() * 255),
            //        (byte)(Platform.Platform.RandomDouble() * 255),
            //      100);
            //canvas.Color = c;
            //canvas.FillRect(startX, topY - bendHeight, width, bottomY - (topY - bendHeight));

            // calculate offsets per step

            var dX = width / BendPoint.MaxPosition;

            canvas.BeginPath();
            for (int i = 0, j = _renderPoints.Count - 1; i < j; i++)
            {
                var firstPt = _renderPoints[i];
                var secondPt = _renderPoints[i + 1];

                // draw pre-bend if previous 
                if (i == 0 && firstPt.Value != 0 && !_note.IsTieDestination)
                {
                    PaintBend(new BendPoint(), firstPt, startX, topY, dX, canvas);
                }

                if (_note.BendType != BendType.Prebend)
                {
                    PaintBend(firstPt, secondPt, startX, topY, dX, canvas);
                }
            }
        }

        private void PaintBend(BendPoint firstPt, BendPoint secondPt, float cx, float cy, float dX, ICanvas canvas)
        {
            var r = (TabBarRenderer)Renderer;
            var res = Renderer.Resources;

            var overflowOffset = r.LineOffset / 2;

            var x1 = cx + (dX * firstPt.Offset);
            var bendValueHeight = BendValueHeight * Scale;
            var y1 = cy - (bendValueHeight * firstPt.Value);
            if (firstPt.Value == 0)
            {
                if (secondPt.Offset == firstPt.Offset)
                {
                    y1 += r.GetNoteY(_note.Beat.MaxStringNote, true);
                }
                else
                {
                    y1 += r.GetNoteY(_note);
                }
            }
            else
            {
                y1 += overflowOffset;
            }
            var x2 = cx + (dX * secondPt.Offset);
            var y2 = cy - (bendValueHeight * secondPt.Value);
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
            var arrowSize = ArrowSize * Scale;
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
                // draw horizontal dashed line 
                // to really have the line ending at the right position
                // we draw from right to left. it's okay if the space is at the beginning
                if (firstPt.Value > 0)
                {
                    var dashX = x2;
                    var dashSize = DashSize * Scale;
                    var end = (x1 + dashSize);
                    var dashes = (dashX - x1) / (dashSize * 2);
                    if (dashes < 1)
                    {
                        canvas.MoveTo(dashX, y1);
                        canvas.LineTo(x1, y1);
                    }
                    else
                    {
                        while (dashX > end)
                        {
                            canvas.MoveTo(dashX, y1);
                            canvas.LineTo(dashX - dashSize, y1);
                            dashX -= dashSize * 2;
                        }
                    }

                    canvas.Stroke();
                }
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

            if (!string.IsNullOrEmpty(_slurText) && firstPt.Offset < secondPt.Offset)
            {
                canvas.Font = res.GraceFont;
                var size = canvas.MeasureText(_slurText);
                var h = Math.Abs(y1 - y2);
                float y;
                float x;
                if (y1 > y2)
                {
                    y = h > canvas.Font.Size * 1.3f ? y1 - h / 2 : y1;
                    x = (x1 + x2 - size) / 2;
                }
                else
                {
                    y = y1;
                    x = x2 - size;
                }

                canvas.FillText(_slurText, x, y);
            }


            if (secondPt.Value != 0 && secondPt.Value != firstPt.Value)
            {
                var dV = secondPt.Value;
                var up = secondPt.Value > firstPt.Value;
                dV = Math.Abs(dV);

                // calculate label
                var s = "";
                // Full Steps
                if (dV == 4)
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
                    if (!up && s != "full")
                    {
                        s = "-" + s;
                    }

                    var startY = y2;
                    if (!up)
                    {
                        startY = y1 + Math.Abs(y2 - y1) * 1f / 3;
                    }

                    // draw label
                    canvas.Font = res.TablatureFont;
                    var size = canvas.MeasureText(s);
                    var y = startY - res.TablatureFont.Size - (2 * Scale);
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
