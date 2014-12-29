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
using AlphaTab.Rendering.Utils;

namespace AlphaTab.Rendering.Glyphs
{
    public class TieGlyph : Glyph
    {
        protected Note StartNote;
        protected Note EndNote;
        protected Glyph Parent;
        protected float YOffset;
        private readonly bool _forEnd;

        public TieGlyph(Note startNote, Note endNote, Glyph parent, bool forEnd)
            : base(0, 0)
        {
            StartNote = startNote;
            EndNote = endNote;
            Parent = parent;
            _forEnd = forEnd;
        }

        public override void DoLayout()
        {
            Width = 0;
        }

        public override bool CanScale
        {
            get { return false; }
        }

        public override void Paint(float cx, float cy, ICanvas canvas)
        {
            if (EndNote == null) return;

            var startNoteRenderer =
                    (GroupedBarRenderer)Renderer.Layout.GetRendererForBar(Renderer.Stave.StaveId, StartNote.Beat.Voice.Bar.Index);
            var endNoteRenderer =
                    (GroupedBarRenderer)Renderer.Layout.GetRendererForBar(Renderer.Stave.StaveId, EndNote.Beat.Voice.Bar.Index);

            float startX = 0;
            float endX = 0;

            float startY = 0;
            float endY = 0;

            var shouldDraw = false;
            var parent = (BeatContainerGlyph)Parent;

            // if we are on the tie start, we check if we 
            // either can draw till the end note, or we just can draw till the bar end
            if (!_forEnd)
            {
                // bar break or line break: to bar end
                if (startNoteRenderer != endNoteRenderer)
                {
                    // TODO: expand tie to next bar if possible, currently we draw a tie till the 
                    // bar end if we have different bars

                    startX = cx + startNoteRenderer.GetNoteX(StartNote);
                    endX = cx + parent.X + parent.PostNotes.X + parent.PostNotes.Width;

                    startY = cy + startNoteRenderer.GetNoteY(StartNote) + YOffset;
                    endY = startY;
                }
                else
                {
                    startX = cx + startNoteRenderer.GetNoteX(StartNote);
                    endX = cx + endNoteRenderer.GetNoteX(EndNote, false);

                    startY = cy + startNoteRenderer.GetNoteY(StartNote) + YOffset;
                    endY = cy + endNoteRenderer.GetNoteY(EndNote) + YOffset;
                }
                shouldDraw = true;
            }
            // if we draw for the tie end, we only draw a tie if we had a line break between start and end
            // in this case there will be a tie from bar start to the note
            else if (startNoteRenderer.Stave != endNoteRenderer.Stave)
            {
                startX = cx;
                endX = cx + endNoteRenderer.GetNoteX(EndNote);

                startY = cy + endNoteRenderer.GetNoteY(EndNote) + YOffset;
                endY = startY;

                shouldDraw = true;
            }

            if (shouldDraw)
            {
                PaintTie(canvas, Scale, startX, startY, endX, endY,
                    GetBeamDirection(StartNote, startNoteRenderer) == BeamDirection.Down);

                canvas.Fill();
            }
        }

        protected virtual BeamDirection GetBeamDirection(Note note, BarRendererBase noteRenderer)
        {
            return BeamDirection.Down;
        }


        /// <summary>
        /// paints a tie between the two given points
        /// </summary>
        /// <param name="canvas"></param>
        /// <param name="scale"></param>
        /// <param name="x1"></param>
        /// <param name="y1"></param>
        /// <param name="x2"></param>
        /// <param name="y2"></param>
        /// <param name="down"></param>
        public static void PaintTie(ICanvas canvas, float scale, float x1, float y1, float x2, float y2,
            bool down = false)
        {
            // ensure endX > startX
            if (x2 > x1)
            {
                var t = x1;
                x1 = x2;
                x2 = t;
                t = y1;
                y1 = y2;
                y2 = t;
            }
            //
            // calculate control points 
            //
            var offset = 15 * scale;
            var size = 4 * scale;
            // normal vector
            var normalVectorX = (y2 - y1);
            var normalVectorY = (x2 - x1);
            var length = (float)Math.Sqrt((normalVectorX * normalVectorX) + (normalVectorY * normalVectorY));
            if (down)
                normalVectorX *= -1;
            else
                normalVectorY *= -1;

            // make to unit vector
            normalVectorX /= length;
            normalVectorY /= length;

            // center of connection
            var centerX = (x2 + x1) / 2;
            var centerY = (y2 + y1) / 2;

            // control points
            var cp1X = centerX + (offset * normalVectorX);
            var cp1Y = centerY + (offset * normalVectorY);
            var cp2X = centerX + ((offset - size) * normalVectorX);
            var cp2Y = centerY + ((offset - size) * normalVectorY);
            canvas.BeginPath();
            canvas.MoveTo(x1, y1);
            canvas.QuadraticCurveTo(cp1X, cp1Y, x2, y2);
            canvas.QuadraticCurveTo(cp2X, cp2Y, x1, y1);
            canvas.ClosePath();
        }
    }
}
