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
using AlphaTab.Model;
using AlphaTab.Platform;

namespace AlphaTab.Rendering.Glyphs
{
    public class ScoreSlideLineGlyph : Glyph
    {
        private readonly Note _startNote;
        private readonly SlideType _type;
        private readonly BeatContainerGlyph _parent;

        public ScoreSlideLineGlyph(SlideType type, Note startNote, BeatContainerGlyph parent)
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

        public override bool CanScale
        {
            get { return false; }
        }

        public override void Paint(float cx, float cy, ICanvas canvas)
        {
            var r = (ScoreBarRenderer)Renderer;
            var sizeX = 12 * Scale;
            var offsetX = 1 * Scale;
            float startX;
            float startY;
            float endX;
            float endY;
            switch (_type)
            {
                case SlideType.Shift:
                case SlideType.Legato:
                    startX = cx + r.GetNoteX(_startNote) + offsetX;
                    startY = cy + r.GetNoteY(_startNote) + NoteHeadGlyph.NoteHeadHeight / 2;

                    if (_startNote.SlideTarget != null)
                    {
                        endX = cx + r.GetNoteX(_startNote.SlideTarget, false) - offsetX;
                        endY = cy + r.GetNoteY(_startNote.SlideTarget) + NoteHeadGlyph.NoteHeadHeight / 2;
                    }
                    else
                    {
                        endX = cx + _parent.X + _parent.PostNotes.X + _parent.PostNotes.Width;
                        endY = startY;
                    }
                    break;
                case SlideType.IntoFromBelow:
                    endX = cx + r.GetNoteX(_startNote, false) - offsetX;
                    endY = cy + r.GetNoteY(_startNote) + NoteHeadGlyph.NoteHeadHeight / 2;

                    startX = endX - sizeX;
                    startY = cy + r.GetNoteY(_startNote) + NoteHeadGlyph.NoteHeadHeight;
                    break;
                case SlideType.IntoFromAbove:
                    endX = cx + r.GetNoteX(_startNote, false) - offsetX;
                    endY = cy + r.GetNoteY(_startNote) + NoteHeadGlyph.NoteHeadHeight / 2;

                    startX = endX - sizeX;
                    startY = cy + r.GetNoteY(_startNote);
                    break;
                case SlideType.OutUp:
                    startX = cx + r.GetNoteX(_startNote) + offsetX;
                    startY = cy + r.GetNoteY(_startNote) + NoteHeadGlyph.NoteHeadHeight / 2;
                    endX = startX + sizeX;
                    endY = cy + r.GetNoteY(_startNote);
                    break;
                case SlideType.OutDown:
                    startX = cx + r.GetNoteX(_startNote) + offsetX;
                    startY = cy + r.GetNoteY(_startNote) + NoteHeadGlyph.NoteHeadHeight / 2;
                    endX = startX + sizeX;
                    endY = cy + r.GetNoteY(_startNote) + NoteHeadGlyph.NoteHeadHeight;
                    break;
                default:
                    return;
            }

            canvas.BeginPath();
            canvas.MoveTo(startX, startY);
            canvas.LineTo(endX, endY);
            canvas.Stroke();
        }
    }
}
