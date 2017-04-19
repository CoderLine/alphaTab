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

using AlphaTab.Collections;
using AlphaTab.Model;
using AlphaTab.Platform;
using AlphaTab.Platform.Model;
using AlphaTab.Rendering.Utils;

namespace AlphaTab.Rendering.Glyphs
{
    public class TabNoteChordGlyph : Glyph
    {
        private readonly FastList<NoteNumberGlyph> _notes;
        private readonly bool _isGrace;

        public Beat Beat { get; set; }
        public BeamingHelper BeamingHelper { get; set; }
        public Note MinStringNote { get; set; }
        public FastDictionary<string, Glyph> BeatEffects { get; set; }
        public FastDictionary<int, NoteNumberGlyph> NotesPerString { get; set; }

        public TabNoteChordGlyph(float x, float y, bool isGrace)
            : base(x, y)
        {
            _isGrace = isGrace;
            _notes = new FastList<NoteNumberGlyph>();
            BeatEffects = new FastDictionary<string, Glyph>();
            NotesPerString = new FastDictionary<int, NoteNumberGlyph>();
        }

        public float GetNoteX(Note note, bool onEnd = true)
        {
            if (NotesPerString.ContainsKey(note.String))
            {
                var n = NotesPerString[note.String];
                var pos = X + n.X;
                if (onEnd)
                {
                    pos += n.Width;
                }
                return pos;
            }
            return 0;
        }

        public float GetNoteY(Note note)
        {
            if (NotesPerString.ContainsKey(note.String))
            {
                return Y + NotesPerString[note.String].Y;
            }
            return 0;
        }

        public override void DoLayout()
        {
            var w = 0f;
            for (int i = 0, j = _notes.Count; i < j; i++)
            {
                var g = _notes[i];
                g.Renderer = Renderer;
                g.DoLayout();
                if (g.Width > w)
                {
                    w = g.Width;
                }
            }

            var tabHeight = Renderer.Resources.TablatureFont.Size;
            var effectY = GetNoteY(MinStringNote) + tabHeight / 2;
            // TODO: take care of actual glyph height
            var effectSpacing = 7 * Scale;
            foreach (var beatEffectKey in BeatEffects)
            {
                var g = BeatEffects[beatEffectKey];
                g.Y += effectY;
                g.X += Width / 2;
                g.Renderer = Renderer;
                effectY += effectSpacing;
                g.DoLayout();
            }

            Width = w;
        }

        public void AddNoteGlyph(NoteNumberGlyph noteGlyph, Note note)
        {
            _notes.Add(noteGlyph);
            NotesPerString[note.String] = noteGlyph;
            if (MinStringNote == null || note.String < MinStringNote.String) MinStringNote = note;
        }

        public override void Paint(float cx, float cy, ICanvas canvas)
        {
            cx += X;
            cy += Y;

            var res = Renderer.Resources;
            var oldBaseLine = canvas.TextBaseline;
            canvas.TextBaseline = TextBaseline.Middle;
            canvas.Font = _isGrace ? res.GraceFont : res.TablatureFont;
            var notes = _notes;
            var w = Width;
            foreach (var g in notes)
            {
                g.Renderer = Renderer;
                g.Width = w;
                g.Paint(cx, cy, canvas);
            }
            canvas.TextBaseline = oldBaseLine;

            foreach (var beatEffectKey in BeatEffects)
            {
                var g = BeatEffects[beatEffectKey];
                g.Paint(cx, cy, canvas);
            }
        }

        public void UpdateBeamingHelper(float cx)
        {
            if (BeamingHelper != null && BeamingHelper.IsPositionFrom(TabBarRenderer.StaffId, Beat))
            {
                BeamingHelper.RegisterBeatLineX(TabBarRenderer.StaffId, Beat, cx + X + Width, cx + X);
            }
        }
    }
}
