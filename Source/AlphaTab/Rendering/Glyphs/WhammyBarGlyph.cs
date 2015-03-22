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
using AlphaTab.Platform.Model;

namespace AlphaTab.Rendering.Glyphs
{
    public class WhammyBarGlyph : Glyph
    {
        private const float WhammyMaxOffset = 60;

        private readonly Beat _beat;
        private readonly BeatContainerGlyph _parent;

        public WhammyBarGlyph(Beat beat, BeatContainerGlyph parent)
            : base(0, 0)
        {
            _beat = beat;
            _parent = parent;
        }

        public override void DoLayout()
        {
            base.DoLayout();

            // 
            // Calculate the min and max offsets
            var minY = 0f;
            var maxY = 0f;

            var sizeY = WhammyMaxOffset * Scale;
            if (_beat.WhammyBarPoints.Count >= 2)
            {
                var dy = sizeY / Beat.WhammyBarMaxValue;
                for (int i = 0, j = _beat.WhammyBarPoints.Count; i < j; i++)
                {
                    var pt = _beat.WhammyBarPoints[i];
                    var ptY = 0 - (dy * pt.Value);
                    if (ptY > maxY) maxY = ptY;
                    if (ptY < minY) minY = ptY;
                }
            }

            //
            // calculate the overflow 
            var tabBarRenderer = (TabBarRenderer)Renderer;
            var track = Renderer.Bar.Track;
            var tabTop = tabBarRenderer.GetTabY(0, -2);
            var tabBottom = tabBarRenderer.GetTabY(track.Tuning.Length, -2);

            var absMinY = Y + minY + tabTop;
            var absMaxY = Y + maxY - tabBottom;

            if (absMinY < 0)
                tabBarRenderer.RegisterOverflowTop(Math.Abs(absMinY));
            if (absMaxY > 0)
                tabBarRenderer.RegisterOverflowBottom(Math.Abs(absMaxY));
        }

        public override void Paint(float cx, float cy, ICanvas canvas)
        {
            var tabBarRenderer = (TabBarRenderer)Renderer;
            var res = Renderer.Resources;
            var startX = cx + X + _parent.OnNotes.Width / 2;
            var endX = _beat.NextBeat == null || _beat.Voice != _beat.NextBeat.Voice
                    ? cx + X + _parent.OnNotes.Width / 2 + _parent.PostNotes.Width
                    : cx + tabBarRenderer.GetBeatX(_beat.NextBeat);
            var startY = cy + X;
            var textOffset = 3 * Scale;

            var sizeY = WhammyMaxOffset * Scale;

            var old = canvas.TextAlign;
            canvas.TextAlign = TextAlign.Center;
            if (_beat.WhammyBarPoints.Count >= 2)
            {
                var dx = (endX - startX) / Beat.WhammyBarMaxPosition;
                var dy = sizeY / Beat.WhammyBarMaxValue;

                canvas.BeginPath();
                for (int i = 0, j = _beat.WhammyBarPoints.Count - 1; i < j; i++)
                {
                    var pt1 = _beat.WhammyBarPoints[i];
                    var pt2 = _beat.WhammyBarPoints[i + 1];

                    if (pt1.Value == pt2.Value && i == _beat.WhammyBarPoints.Count - 2) continue;

                    var pt1X = startX + (dx * pt1.Offset);
                    var pt1Y = startY - (dy * pt1.Value);

                    var pt2X = startX + (dx * pt2.Offset);
                    var pt2Y = startY - (dy * pt2.Value);

                    canvas.MoveTo(pt1X, pt1Y);
                    canvas.LineTo(pt2X, pt2Y);

                    if (pt2.Value != 0)
                    {
                        var dv = pt2.Value / 4.0;
                        var up = (pt2.Value - pt1.Value) >= 0;
                        var s = "";
                        if (dv < 0) s += "-";

                        if (dv >= 1 || dv <= -1)
                            s += Math.Abs(dv) + " ";

                        dv -= (int)dv;
                        if (dv == 0.25)
                            s += "1/4";
                        else if (dv == 0.5)
                            s += "1/2";
                        else if (dv == 0.75)
                            s += "3/4";

                        canvas.Font = res.GraceFont;
                        //var size = canvas.MeasureText(s);
                        var sy = up
                                    ? pt2Y - res.GraceFont.Size - textOffset
                                    : pt2Y + textOffset;
                        var sx = pt2X;
                        canvas.FillText(s, sx, sy);

                    }
                }
                canvas.Stroke();
            }
            canvas.TextAlign = old;
        }
    }
}
