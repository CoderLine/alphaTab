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
    class TabWhammyBarGlyph : Glyph
    {
        private const string TopOffsetSharedDataKey = "tab.whammy.topoffset";
        public const int PerHalfSize = 6;
        private const int DashSize = 3;

        private readonly Beat _beat;
        private FastList<BendPoint> _renderPoints;
        private bool _isSimpleDip;

        public TabWhammyBarGlyph(Beat beat)
            : base(0, 0)
        {
            _beat = beat;
            _renderPoints = CreateRenderingPoints(beat);
            _isSimpleDip = false;
        }

        private FastList<BendPoint> CreateRenderingPoints(Beat beat)
        {
            // advanced rendering
            if (beat.WhammyBarType == WhammyType.Custom)
            {
                return beat.WhammyBarPoints;
            }

            var renderingPoints = new FastList<BendPoint>();

            // Guitar Pro Rendering Note: 
            // Last point of bend is always at end of the beat even 
            // though it might not be 100% correct from timing perspective. 

            switch (beat.WhammyBarType)
            {
                case WhammyType.Dive:
                case WhammyType.Hold:
                case WhammyType.PrediveDive:
                case WhammyType.Predive:
                    renderingPoints.Add(new BendPoint(0, beat.WhammyBarPoints[0].Value));
                    renderingPoints.Add(new BendPoint(BendPoint.MaxPosition, beat.WhammyBarPoints[1].Value));
                    break;
                case WhammyType.Dip:
                    renderingPoints.Add(new BendPoint(0, beat.WhammyBarPoints[0].Value));
                    renderingPoints.Add(new BendPoint(BendPoint.MaxPosition / 2, beat.WhammyBarPoints[1].Value));
                    renderingPoints.Add(new BendPoint(BendPoint.MaxPosition, beat.WhammyBarPoints[beat.WhammyBarPoints.Count - 1].Value));
                    break;
            }

            return renderingPoints;
        }



        public override void DoLayout()
        {
            base.DoLayout();

            _isSimpleDip = Renderer.Settings.DisplayMode == DisplayMode.SongBook &&
                           _beat.WhammyBarType == WhammyType.Dip;

            // 
            // Get the min and max values for all combined whammys
            BendPoint minValue = null;
            BendPoint maxValue = null;

            Beat beat = _beat;
            while (beat != null && beat.HasWhammyBar)
            {
                if (minValue == null || minValue.Value > beat.MinWhammyPoint.Value)
                {
                    minValue = beat.MinWhammyPoint;
                }

                if (maxValue == null || maxValue.Value < beat.MaxWhammyPoint.Value)
                {
                    maxValue = beat.MaxWhammyPoint;
                }

                beat = beat.NextBeat;
            }

            var topOffset = maxValue.Value > 0 ? Math.Abs(GetOffset(maxValue.Value)) : 0;

            if (topOffset > 0 || _beat.WhammyBarPoints[0].Value != 0 || Renderer.Settings.ShowZeroOnDiveWhammy)
            {
                topOffset += Renderer.Resources.TablatureFont.Size * 2f;
            }

            var bottomOffset = minValue.Value < 0 ? Math.Abs(GetOffset(minValue.Value)) : 0;

            Renderer.RegisterOverflowTop(topOffset + bottomOffset);

            var currentOffset = Renderer.Staff.GetSharedLayoutData(TopOffsetSharedDataKey, -1);
            if (topOffset > currentOffset)
            {
                Renderer.Staff.SetSharedLayoutData(TopOffsetSharedDataKey, topOffset);
            }
        }

        private float GetOffset(int value)
        {
            if (value == 0) return 0;

            var offset = PerHalfSize * Scale + Platform.Platform.Log2(Math.Abs(value) / 2f) * PerHalfSize * Scale;
            if (value < 0)
            {
                offset = -offset;
            }
            return offset;
        }

        public override void Paint(float cx, float cy, ICanvas canvas)
        {
            var startNoteRenderer = Renderer;

            Beat endBeat = _beat.NextBeat;
            TabBarRenderer endNoteRenderer = null;
            BeatXPosition endXPositionType = BeatXPosition.PreNotes;
            if (endBeat != null)
            {
                endNoteRenderer = Renderer.ScoreRenderer.Layout.GetRendererForBar<TabBarRenderer>(Renderer.Staff.StaveId, endBeat.Voice.Bar);
                if (endNoteRenderer == null || endNoteRenderer.Staff != startNoteRenderer.Staff)
                {
                    endBeat = null;
                    endNoteRenderer = null;
                }
                else if (endNoteRenderer != startNoteRenderer && !endBeat.HasWhammyBar)
                {
                    endBeat = null;
                    endNoteRenderer = null;
                }
                else
                {
                    endXPositionType = endBeat.HasWhammyBar
                                       && (startNoteRenderer.Settings.DisplayMode != DisplayMode.SongBook ||
                                           endBeat.WhammyBarType != WhammyType.Dip)
                        ? BeatXPosition.MiddleNotes
                        : BeatXPosition.PreNotes;
                }
            }

            float startX;
            float endX;

            if (_isSimpleDip)
            {
                startX = cx + startNoteRenderer.X + startNoteRenderer.GetBeatX(_beat, BeatXPosition.OnNotes)
                         - ScoreWhammyBarGlyph.SimpleDipPadding * Scale;
                endX = cx + startNoteRenderer.X + startNoteRenderer.GetBeatX(_beat, BeatXPosition.PostNotes)
                         + ScoreWhammyBarGlyph.SimpleDipPadding * Scale;
            }
            else
            {
                startX = cx + startNoteRenderer.X + startNoteRenderer.GetBeatX(_beat, BeatXPosition.MiddleNotes);
                endX = endNoteRenderer == null
                    ? cx + startNoteRenderer.X + startNoteRenderer.Width - 2 * Scale
                    : cx + endNoteRenderer.X + endNoteRenderer.GetBeatX(endBeat, endXPositionType);
            }


            var old = canvas.TextAlign;
            canvas.TextAlign = TextAlign.Center;
            if (_renderPoints.Count >= 2)
            {
                var dx = (endX - startX) / Beat.WhammyBarMaxPosition;
                canvas.BeginPath();

                var zeroY = cy + Renderer.Staff.GetSharedLayoutData(TopOffsetSharedDataKey, 0);

                for (int i = 0, j = _renderPoints.Count - 1; i < j; i++)
                {
                    var firstPt = _renderPoints[i];
                    var secondPt = _renderPoints[i + 1];
                    var nextPt = i < j - 2 ? _renderPoints[i + 2] : null;

                    var isFirst = i == 0;
                    // draw pre-bend if previous 
                    if (i == 0 && firstPt.Value != 0 && !_beat.IsContinuedWhammy)
                    {
                        PaintWhammy(false, new BendPoint(), firstPt, secondPt, startX, zeroY, dx, canvas);
                        isFirst = false;
                    }

                    PaintWhammy(isFirst, firstPt, secondPt, nextPt, startX, zeroY, dx, canvas);
                }
                canvas.Stroke();
            }
            canvas.TextAlign = old;
        }

        private void PaintWhammy(bool isFirst, BendPoint firstPt, BendPoint secondPt, BendPoint nextPt, float cx, float cy, float dx, ICanvas canvas)
        {
            var x1 = cx + dx * firstPt.Offset;
            var x2 = cx + dx * secondPt.Offset;

            var y1 = cy - GetOffset(firstPt.Value);
            var y2 = cy - GetOffset(secondPt.Value);

            if (firstPt.Offset == secondPt.Offset)
            {
                var dashSize = DashSize * Scale;
                var dashes = Math.Abs(y2 - y1) / (dashSize * 2);
                if (dashes < 1)
                {
                    canvas.MoveTo(x1, y1);
                    canvas.LineTo(x2, y2);
                }
                else
                {
                    var dashEndY = Math.Max(y1, y2);
                    var dashStartY = Math.Min(y1, y2);

                    while (dashEndY > dashStartY)
                    {
                        canvas.MoveTo(x1, dashStartY);
                        canvas.LineTo(x1, dashStartY + dashSize);

                        dashStartY += dashSize * 2;
                    }
                }
                canvas.Stroke();
            }
            else if (firstPt.Value == secondPt.Value)
            {
                var dashSize = DashSize * Scale;
                var dashes = Math.Abs(x2 - x1) / (dashSize * 2);
                if (dashes < 1)
                {
                    canvas.MoveTo(x1, y1);
                    canvas.LineTo(x2, y2);
                }
                else
                {
                    var dashEndX = Math.Max(x1, x2);
                    var dashStartX = Math.Min(x1, x2);

                    while (dashEndX > dashStartX)
                    {
                        canvas.MoveTo(dashEndX, y1);
                        canvas.LineTo(dashEndX - dashSize, y1);

                        dashEndX -= dashSize * 2;
                    }
                }
                canvas.Stroke();
            }
            else
            {
                canvas.MoveTo(x1, y1);
                canvas.LineTo(x2, y2);
            }

            var res = canvas.Resources;

            if (isFirst && Renderer.Settings.ShowZeroOnDiveWhammy && !_beat.IsContinuedWhammy && !_isSimpleDip)
            {
                var s = "0";
                float y = y1;
                y -= res.TablatureFont.Size + (2 * Scale);
                canvas.FillText(s, x1, y);
            }

            var dV = Math.Abs(secondPt.Value);
            if ((dV != 0 || (Renderer.Settings.ShowZeroOnDiveWhammy && !_isSimpleDip)) && firstPt.Value != secondPt.Value)
            {

                var s = "";
                if (secondPt.Value < 0)
                {
                    s += "-";
                }

                if (dV >= 4)
                {
                    int steps = dV / 4;
                    s += steps;
                    // Quaters
                    dV -= steps * 4;
                }
                else if (dV == 0)
                {
                    s += "0";
                }

                if (dV > 0)
                {
                    s += TabBendGlyph.GetFractionSign(dV);
                }

                float y;
                if (_isSimpleDip)
                {
                    y = Math.Min(y1, y2) - res.TablatureFont.Size - (2 * Scale);
                }
                else
                {
                    y = firstPt.Offset == secondPt.Offset ? Math.Min(y1, y2) : y2;
                    y -= res.TablatureFont.Size + (2 * Scale);
                    if (nextPt != null && nextPt.Value > secondPt.Value)
                    {
                        y -= (2 * Scale);
                    }
                }

                var x = x2;

                canvas.FillText(s, x, y);
            }
        }
    }
}