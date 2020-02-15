﻿using System;
using AlphaTab.Model;
using AlphaTab.Platform;
using AlphaTab.Rendering.Utils;

namespace AlphaTab.Rendering.Glyphs
{
    internal class TieGlyph : Glyph
    {
        protected Beat StartBeat;
        protected Beat EndBeat;
        protected float YOffset;
        protected readonly bool ForEnd;

        public TieGlyph(Beat startBeat, Beat endBeat, bool forEnd)
            : base(0, 0)
        {
            StartBeat = startBeat;
            EndBeat = endBeat;
            ForEnd = forEnd;
        }

        public override void DoLayout()
        {
            Width = 0;
        }


        public override void Paint(float cx, float cy, ICanvas canvas)
        {
            if (EndBeat == null)
            {
                return;
            }

            var startNoteRenderer =
                Renderer.ScoreRenderer.Layout.GetRendererForBar<BarRendererBase>(Renderer.Staff.StaveId,
                    StartBeat.Voice.Bar);
            var endNoteRenderer =
                Renderer.ScoreRenderer.Layout.GetRendererForBar<BarRendererBase>(Renderer.Staff.StaveId,
                    EndBeat.Voice.Bar);

            float startX = 0;
            float endX = 0;

            float startY = 0;
            float endY = 0;

            var shouldDraw = false;

            // if we are on the tie start, we check if we
            // either can draw till the end note, or we just can draw till the bar end
            var direction = startNoteRenderer == null
                ? GetBeamDirection(EndBeat, endNoteRenderer)
                : GetBeamDirection(StartBeat, startNoteRenderer);
            if (!ForEnd && startNoteRenderer != null)
            {
                // line break or bar break
                if (startNoteRenderer != endNoteRenderer)
                {
                    startX = cx + startNoteRenderer.X + GetStartX(startNoteRenderer);
                    startY = cy + startNoteRenderer.Y + GetStartY(startNoteRenderer, direction) + YOffset;

                    // line break: to bar end
                    if (endNoteRenderer == null || startNoteRenderer.Staff != endNoteRenderer.Staff)
                    {
                        endX = cx + startNoteRenderer.X + startNoteRenderer.Width;
                        endY = startY;
                    }
                    // bar break: to tie destination
                    // differs only by addition of EndNote X coordinate
                    else
                    {
                        endX = cx + endNoteRenderer.X + GetEndX(endNoteRenderer);
                        endY = cy + endNoteRenderer.Y + GetEndY(endNoteRenderer, direction) + YOffset;
                    }
                }
                else
                {
                    startX = cx + startNoteRenderer.X + GetStartX(startNoteRenderer);
                    endX = cx + endNoteRenderer.X + GetEndX(endNoteRenderer);
                    startY = cy + startNoteRenderer.Y + GetStartY(startNoteRenderer, direction) + YOffset;
                    endY = cy + endNoteRenderer.Y + GetEndY(endNoteRenderer, direction) + YOffset;
                }

                shouldDraw = true;
            }
            // if we draw for the tie end, we only draw a tie if we had a line break between start and end
            // in this case there will be a tie from bar start to the note
            else if (startNoteRenderer == null || startNoteRenderer.Staff != endNoteRenderer.Staff)
            {
                startX = cx + endNoteRenderer.X;
                endX = cx + endNoteRenderer.X + GetEndX(endNoteRenderer);

                startY = cy + endNoteRenderer.Y + GetEndY(endNoteRenderer, direction) + YOffset;
                endY = startY;

                shouldDraw = true;
            }


            if (shouldDraw)
            {
                PaintTie(canvas,
                    Scale,
                    startX,
                    startY,
                    endX,
                    endY,
                    direction == BeamDirection.Down,
                    GetTieHeight(startX, startY, endX, endY));

                canvas.Fill();
            }
        }

        protected virtual float GetTieHeight(float startX, float startY, float endX, float endY)
        {
            return 22f;
        }

        protected virtual BeamDirection GetBeamDirection(Beat beat, BarRendererBase noteRenderer)
        {
            return BeamDirection.Down;
        }


        protected virtual float GetStartY(BarRendererBase noteRenderer, BeamDirection direction)
        {
            return 0;
        }

        protected virtual float GetEndY(BarRendererBase noteRenderer, BeamDirection direction)
        {
            return 0;
        }

        protected virtual float GetStartX(BarRendererBase noteRenderer)
        {
            return 0;
        }

        protected virtual float GetEndX(BarRendererBase noteRenderer)
        {
            return 0;
        }

        public static void PaintTie(
            ICanvas canvas,
            float scale,
            float x1,
            float y1,
            float x2,
            float y2,
            bool down = false,
            float offset = 22,
            float size = 4)
        {
            if (x1 == x2 && y1 == y2)
            {
                return;
            }

            // ensure endX > startX
            if (x2 < x1)
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

            offset *= scale;
            size *= scale;
            // normal vector
            var normalVectorX = y2 - y1;
            var normalVectorY = x2 - x1;
            var length = (float)Math.Sqrt(normalVectorX * normalVectorX + normalVectorY * normalVectorY);
            if (down)
            {
                normalVectorX *= -1;
            }
            else
            {
                normalVectorY *= -1;
            }

            // make to unit vector
            normalVectorX /= length;
            normalVectorY /= length;

            // center of connection
            var centerX = (x2 + x1) / 2;
            var centerY = (y2 + y1) / 2;

            // control points
            var cp1X = centerX + offset * normalVectorX;
            var cp1Y = centerY + offset * normalVectorY;
            var cp2X = centerX + (offset - size) * normalVectorX;
            var cp2Y = centerY + (offset - size) * normalVectorY;


            canvas.BeginPath();
            canvas.MoveTo(x1, y1);
            canvas.QuadraticCurveTo(cp1X, cp1Y, x2, y2);
            canvas.QuadraticCurveTo(cp2X, cp2Y, x1, y1);
            canvas.ClosePath();
        }
    }
}
