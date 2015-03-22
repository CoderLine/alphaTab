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

namespace AlphaTab.Rendering.Glyphs
{
    public class TabBeatPostNotesGlyph : BeatGlyphBase
    {
        public override void DoLayout()
        {
            // note specific effects
            NoteLoop(CreateNoteGlyphs);

            AddGlyph(new SpacingGlyph(0, 0, BeatDurationWidth * Scale));

            base.DoLayout();
        }

        private void CreateNoteGlyphs(Note n)
        {
            if (n.IsTrill)
            {
                AddGlyph(new SpacingGlyph(0, 0, 4 * Scale));
                var trillNote = new Note();
                trillNote.IsGhost = true;
                trillNote.Fret = n.TrillFret;
                trillNote.String = n.String;
                var tr = (TabBarRenderer)Renderer;
                var trillNumberGlyph = new NoteNumberGlyph(0, 0, trillNote, true);
                var l = n.Beat.Voice.Bar.Track.Tuning.Length - n.String;
                trillNumberGlyph.Y = tr.GetTabY(l);

                AddGlyph(trillNumberGlyph);
            }

            if (n.HasBend && n.Beat.GraceType != GraceType.None)
            {
                var bendHeight = 60 * Scale;
                Renderer.RegisterOverflowTop(bendHeight);
                AddGlyph(new BendGlyph(n, BeatDurationWidth * Scale, bendHeight));
            }
        }
    }
}
