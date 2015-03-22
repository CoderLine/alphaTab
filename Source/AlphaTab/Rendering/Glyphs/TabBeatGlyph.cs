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
using AlphaTab.Rendering.Layout;
using AlphaTab.Rendering.Utils;

namespace AlphaTab.Rendering.Glyphs
{
    public class TabBeatGlyph : BeatGlyphBase, ISupportsFinalize
    {
        public TabNoteChordGlyph NoteNumbers { get; set; }
        public BeamingHelper BeamingHelper { get; set; }

        public override void DoLayout()
        {
            // create glyphs
            if (!Container.Beat.IsRest)
            {
                //
                // Note numbers
                NoteNumbers = new TabNoteChordGlyph(0, 0, Container.Beat.GraceType != GraceType.None);
                NoteNumbers.Beat = Container.Beat;
                NoteNumbers.BeamingHelper = BeamingHelper;
                NoteLoop(CreateNoteGlyph);
                AddGlyph(NoteNumbers);

                //
                // Whammy Bar
                if (Container.Beat.HasWhammyBar && !NoteNumbers.BeatEffects.ContainsKey("Whammy"))
                {
                    NoteNumbers.BeatEffects["Whammy"] = new WhammyBarGlyph(Container.Beat, Container);
                }

                //
                // Tremolo Picking
                if (Container.Beat.IsTremolo && !NoteNumbers.BeatEffects.ContainsKey("Tremolo"))
                {
                    NoteNumbers.BeatEffects["Tremolo"] = new TremoloPickingGlyph(0, 0, Container.Beat.TremoloSpeed.Value);
                }
            }

            // left to right layout
            if (Glyphs == null) return;
            var w = 0f;
            for (int i = 0, j = Glyphs.Count; i < j; i++)
            {
                var g = Glyphs[i];
                g.X = w;
                g.Renderer = Renderer;
                g.DoLayout();
                w += g.Width;
            }
            Width = w;
        }

        public override void FinalizeGlyph(ScoreLayout layout)
        {
            if (!Container.Beat.IsRest)
            {
                NoteNumbers.UpdateBeamingHelper(Container.X + X);
            }
        }

        public override void ApplyGlyphSpacing(float spacing)
        {
            base.ApplyGlyphSpacing(spacing);
            // TODO: we need to tell the beaming helper the position of rest beats
            if (!Container.Beat.IsRest)
            {
                NoteNumbers.UpdateBeamingHelper(Container.X + X);
            }
        }

        private void CreateNoteGlyph(Note n)
        {
            var isGrace = Container.Beat.GraceType != GraceType.None;
            var tr = (TabBarRenderer)Renderer;
            var noteNumberGlyph = new NoteNumberGlyph(0, 0, n, isGrace);
            var l = n.Beat.Voice.Bar.Track.Tuning.Length - n.String + 1;
            noteNumberGlyph.Y = tr.GetTabY(l, -2);
            NoteNumbers.AddNoteGlyph(noteNumberGlyph, n);
        }
    }
}
