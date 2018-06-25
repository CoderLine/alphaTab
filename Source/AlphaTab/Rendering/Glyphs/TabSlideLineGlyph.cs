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
using AlphaTab.Model;
using AlphaTab.Platform;

namespace AlphaTab.Rendering.Glyphs
{
    class TabSlideLineGlyph : Glyph
    {
        private readonly Note _startNote;
        private readonly SlideType _type;
        private readonly BeatContainerGlyph _parent;

        public TabSlideLineGlyph(SlideType type, Note startNote, BeatContainerGlyph parent)
            : base(0, 0)
        {
            _type = type;
            _startNote = startNote;
            _parent = parent;
        }

        public override void DoLayout()
        {
            Width = 0;
        }

        public override void Paint(float cx, float cy, ICanvas canvas)
        {
            var startNoteRenderer = (TabBarRenderer)Renderer;
            cx += startNoteRenderer.X;
            cy += startNoteRenderer.Y;

            var sizeX = 12 * Scale;
            var sizeY = 3 * Scale;
            float startX;
            float startY;
            float endX;
            float endY;
            bool waves = false;

            switch (_type)
            {
                case SlideType.Shift:
                case SlideType.Legato:
                    float startOffsetY;
                    float endOffsetY;

                    if (_startNote.SlideTarget == null)
                    {
                        startOffsetY = 0;
                        endOffsetY = 0;
                    }
                    else if (_startNote.SlideTarget.Fret > _startNote.Fret)
                    {
                        startOffsetY = sizeY;
                        endOffsetY = sizeY * -1;
                    }
                    else
                    {
                        startOffsetY = sizeY * -1;
                        endOffsetY = sizeY;
                    }

                    startX = cx + startNoteRenderer.GetBeatX(_startNote.Beat, BeatXPosition.PostNotes);
                    startY = cy + startNoteRenderer.GetNoteY(_startNote) + startOffsetY;
                    if (_startNote.SlideTarget != null)
                    {
                        var endNoteRenderer = Renderer.ScoreRenderer.Layout.GetRendererForBar<BarRendererBase>(Renderer.Staff.StaveId, _startNote.SlideTarget.Beat.Voice.Bar);
                        if (endNoteRenderer == null || endNoteRenderer.Staff != startNoteRenderer.Staff)
                        {
                            endX = cx + _parent.X;
                            endY = startY;
                        }
                        else
                        {
                            endX = cx + endNoteRenderer.GetBeatX(_startNote.SlideTarget.Beat, BeatXPosition.OnNotes);
                            endY = cy + endNoteRenderer.GetNoteY(_startNote.SlideTarget) + endOffsetY;
                        }
                    }
                    else
                    {
                        endX = cx + _parent.X;
                        endY = startY;
                    }
                    break;

                case SlideType.IntoFromBelow:
                    endX = cx + startNoteRenderer.GetNoteX(_startNote, false);
                    endY = cy + startNoteRenderer.GetNoteY(_startNote);

                    startX = endX - sizeX;
                    startY = cy + startNoteRenderer.GetNoteY(_startNote) + sizeY;
                    break;
                case SlideType.IntoFromAbove:
                    endX = cx + startNoteRenderer.GetNoteX(_startNote, false);
                    endY = cy + startNoteRenderer.GetNoteY(_startNote);

                    startX = endX - sizeX;
                    startY = cy + startNoteRenderer.GetNoteY(_startNote) - sizeY;
                    break;
                case SlideType.OutUp:
                    startX = cx + startNoteRenderer.GetNoteX(_startNote);
                    startY = cy + startNoteRenderer.GetNoteY(_startNote);

                    endX = startX + sizeX;
                    endY = cy + startNoteRenderer.GetNoteY(_startNote) - sizeY;
                    break;

                case SlideType.OutDown:
                    startX = cx + startNoteRenderer.GetNoteX(_startNote);
                    startY = cy + startNoteRenderer.GetNoteY(_startNote);

                    endX = startX + sizeX;
                    endY = cy + startNoteRenderer.GetNoteY(_startNote) + sizeY;
                    break;

                case SlideType.PickSlideDown:

                    startX = cx + startNoteRenderer.GetNoteX(_startNote);
                    startY = cy + startNoteRenderer.GetNoteY(_startNote) - sizeY * 2;

                    endX = cx + startNoteRenderer.GetBeatX(_startNote.Beat, BeatXPosition.EndBeat);
                    endY = startY + sizeY * 3;

                    waves = true;
                    break;

                case SlideType.PickSlideUp:

                    startX = cx + startNoteRenderer.GetNoteX(_startNote);
                    startY = cy + startNoteRenderer.GetNoteY(_startNote) + sizeY;

                    endX = cx + startNoteRenderer.GetBeatX(_startNote.Beat, BeatXPosition.EndBeat);
                    endY = startY - sizeY * 3;

                    waves = true;
                    break;
                default:
                    return;
            }

            if (waves)
            {
                var b = endX - startX;
                var a = endY - startY;
                var c = Math.Sqrt(Math.Pow(a, 2) + Math.Pow(b, 2));
                var angle = (float)(Math.Asin(a / c) * (180 / Math.PI));
                canvas.BeginRotate(startX, startY, angle);

                var glyph = new NoteVibratoGlyph(0, 0, VibratoType.Slight);
                glyph.Renderer = Renderer;
                glyph.DoLayout();
                glyph.Width = b;
                glyph.Paint(0, 0, canvas);

                canvas.EndRotate();
            }
            else
            {
                canvas.BeginPath();
                canvas.MoveTo(startX, startY);
                canvas.LineTo(endX, endY);
                canvas.Stroke();
            }

        }
    }
}
