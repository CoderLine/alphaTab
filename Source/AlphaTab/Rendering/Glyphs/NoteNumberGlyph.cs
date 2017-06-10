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
using AlphaTab.Model;
using AlphaTab.Platform;
using AlphaTab.Platform.Model;

namespace AlphaTab.Rendering.Glyphs
{
    public class NoteNumberGlyph : Glyph
    {
        private readonly string _noteString;
        private float _noteStringWidth;
        private readonly string _trillNoteString;
        private float _trillNoteStringWidth;

        public bool IsEmpty { get; set; }

        public NoteNumberGlyph(float x, float y, Note n)
            : base(x, y)
        {
            if (!n.IsTieDestination)
            {
                _noteString = n.IsDead ? "x" : (n.Fret - n.Beat.Voice.Bar.Staff.Track.TranspositionPitch).ToString();
                if (n.IsGhost)
                {
                    _noteString = "(" + _noteString + ")";
                }
            }
            else if (n.Beat.Index == 0 || n.HasBend)
            {
                _noteString = "(" + (n.TieOrigin.Fret - n.Beat.Voice.Bar.Staff.Track.TranspositionPitch) + ")";
            }
            else
            {
                _noteString = "";
            }

            if (n.IsTrill)
            {
                _trillNoteString = "(" + (n.TrillFret - n.Beat.Voice.Bar.Staff.Track.TranspositionPitch) + ")";
            }
            else
            {
                _trillNoteString = "";
            }
        }

        public override void DoLayout()
        {
            IsEmpty = string.IsNullOrEmpty(_noteString) && string.IsNullOrEmpty(_trillNoteString);
            if (!IsEmpty)
            {
                Renderer.ScoreRenderer.Canvas.Font = Renderer.Resources.TablatureFont;
                _noteStringWidth = Renderer.ScoreRenderer.Canvas.MeasureText(_noteString);
                _trillNoteStringWidth = Renderer.ScoreRenderer.Canvas.MeasureText(_trillNoteString);
                Width = _noteStringWidth + _trillNoteStringWidth;
            }
        }

        public override void Paint(float cx, float cy, ICanvas canvas)
        {
            if (IsEmpty) return;
            var textWidth = _noteStringWidth + _trillNoteStringWidth;
            var x = cx + X + (Width - textWidth) / 2;
            canvas.FillText(_noteString, x, cy + Y);
            canvas.FillText(_trillNoteString, x + _noteStringWidth, cy + Y);
        }
    }
}
