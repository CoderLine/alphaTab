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
using System.Runtime.CompilerServices;
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
        private readonly FastDictionary<int, NoteNumberGlyph> _noteLookup;
        private Note _minNote;
        private readonly bool _isGrace;
        private int _centerX;

        public Beat Beat { get; set; }
        public BeamingHelper BeamingHelper { get; set; }
        public FastDictionary<string, Glyph> BeatEffects { get; set; }

        public TabNoteChordGlyph(int x, int y, bool isGrace)
            : base(x, y)
        {
            _isGrace = isGrace;
            _notes = new FastList<NoteNumberGlyph>();
            BeatEffects = new FastDictionary<string, Glyph>();
            _noteLookup = new FastDictionary<int, NoteNumberGlyph>();
        }

        public int GetNoteX(Note note, bool onEnd = true)
        {
            if (_noteLookup.ContainsKey(note.String))
            {
                var n = _noteLookup[note.String];
                var pos = X + n.X + (int)(NoteNumberGlyph.Padding * Scale);
                if (onEnd)
                {
                    n.CalculateWidth();
                    pos += n.Width;
                }
                return pos;
            }
            return 0;
        }

        public int GetNoteY(Note note)
        {
            if (_noteLookup.ContainsKey(note.String))
            {
                return Y + _noteLookup[note.String].Y;
            }
            return 0;
        }

        public override void DoLayout()
        {
            var w = 0;
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
            var effectY = (int)(GetNoteY(_minNote) + tabHeight / 2);
            // TODO: take care of actual glyph height
            var effectSpacing = (int)(7 * Scale);
            Std.Foreach(BeatEffects.Values, g =>
            {
                g.Y = effectY;
                g.X = Width / 2;
                g.Renderer = Renderer;
                effectY += effectSpacing;
                g.DoLayout();
            });

            _centerX = 0;

            Width = w;
        }

        public void AddNoteGlyph(NoteNumberGlyph noteGlyph, Note note)
        {
            _notes.Add(noteGlyph);
            _noteLookup[note.String] = noteGlyph;
            if (_minNote == null || note.String < _minNote.String) _minNote = note;
        }

        public override void Paint(int cx, int cy, ICanvas canvas)
        {
            var res = Renderer.Resources;
            var old = canvas.TextBaseline;
            canvas.TextBaseline = TextBaseline.Middle;
            canvas.Font = _isGrace ? res.GraceFont : res.TablatureFont;
            for (int i = 0, j = _notes.Count; i < j; i++)
            {
                var g = _notes[i];
                g.Renderer = Renderer;
                g.Paint(cx + X, cy + Y, canvas);
            }
            canvas.TextBaseline = old;

            Std.Foreach(BeatEffects.Values, g => g.Paint(cx + X, cy + Y, canvas));
        }

        public void UpdateBeamingHelper(int cx)
        {
            if (!BeamingHelper.HasBeatLineX(Beat))
            {
                BeamingHelper.RegisterBeatLineX(Beat, cx + X + _centerX, cx + X + _centerX);
            }
        }
    }
}
