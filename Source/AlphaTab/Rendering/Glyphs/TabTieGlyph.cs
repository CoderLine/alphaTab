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
using AlphaTab.Model;
using AlphaTab.Rendering.Utils;

namespace AlphaTab.Rendering.Glyphs
{
    class TabTieGlyph : TieGlyph
    {
        protected Note StartNote;
        protected Note EndNote;
        protected readonly bool ForSlide;

        public TabTieGlyph(Note startNote, Note endNote, bool forSlide, bool forEnd = false)
            : base(startNote.Beat, endNote.Beat, forEnd)
        {
            StartNote = startNote;
            EndNote = endNote;
            ForSlide = forSlide;
        }

        private float Offset
        {
            get { return ForSlide ? 5 * Scale : 0; }
        }

        protected override BeamDirection GetBeamDirection(Beat beat, BarRendererBase noteRenderer)
        {
            return GetBeamDirection(StartNote);
        }

        protected static BeamDirection GetBeamDirection(Note note)
        {
            return note.String > 3
                ? BeamDirection.Up
                : BeamDirection.Down;
        }

        protected override float GetStartY(BarRendererBase noteRenderer, BeamDirection direction)
        {
            return noteRenderer.GetNoteY(StartNote) - Offset;
        }

        protected override float GetEndY(BarRendererBase noteRenderer, BeamDirection direction)
        {
            return noteRenderer.GetNoteY(EndNote) - Offset;
        }

        protected override float GetStartX(BarRendererBase noteRenderer)
        {
            return noteRenderer.GetNoteX(StartNote);
        }

        protected override float GetEndX(BarRendererBase noteRenderer)
        {
            return noteRenderer.GetNoteX(EndNote, false);
        }
    }
}