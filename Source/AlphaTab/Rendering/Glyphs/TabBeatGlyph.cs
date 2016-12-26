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
    public class TabBeatGlyph : BeatOnNoteGlyphBase
    {
        public TabNoteChordGlyph NoteNumbers { get; set; }
        public TabRestGlyph RestGlyph { get; set; }

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
                foreach (var note in Container.Beat.Notes)
                {
                    CreateNoteGlyph(note);
                }
                AddGlyph(NoteNumbers);

                //
                // Whammy Bar
                if (Container.Beat.HasWhammyBar && !NoteNumbers.BeatEffects.ContainsKey("Whammy"))
                {
                    NoteNumbers.BeatEffects["Whammy"] = new WhammyBarGlyph(Container.Beat, Container);

                    var whammyValueHeight = (WhammyBarGlyph.WhammyMaxOffset*Scale)/Beat.WhammyBarMaxValue;

                    var whammyHeight = Container.Beat.MaxWhammyPoint.Value * whammyValueHeight;
                    Renderer.RegisterOverflowTop(whammyHeight);
                }

                //
                // Tremolo Picking
                if (Container.Beat.IsTremolo && !NoteNumbers.BeatEffects.ContainsKey("Tremolo"))
                {
                    int offset = 0;
                    var speed = Container.Beat.TremoloSpeed.Value;
                    switch (speed)
                    {
                        case Duration.ThirtySecond:
                            offset = 10;
                            break;
                        case Duration.Sixteenth:
                            offset = 5;
                            break;
                        case Duration.Eighth:
                            offset = 0;
                            break;
                    }

                    NoteNumbers.BeatEffects["Tremolo"] = new TremoloPickingGlyph(5 * Scale, offset * Scale,
                        Container.Beat.TremoloSpeed.Value);
                }
            }
            else
            {
                RestGlyph = new TabRestGlyph();
                RestGlyph.Beat = Container.Beat;
                RestGlyph.BeamingHelper = BeamingHelper;
                AddGlyph(RestGlyph);
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

        public override void UpdateBeamingHelper()
        {
            if (!Container.Beat.IsRest)
            {
                NoteNumbers.UpdateBeamingHelper(Container.X + X);
            }
            else
            {
                RestGlyph.UpdateBeamingHelper(Container.X + X);
            }
        }

        private void CreateNoteGlyph(Note n)
        {
            var tr = (TabBarRenderer)Renderer;
            var noteNumberGlyph = new NoteNumberGlyph(0, 0, n);
            var l = n.Beat.Voice.Bar.Staff.Track.Tuning.Length - n.String + 1;
            noteNumberGlyph.Y = tr.GetTabY(l, -2);
            noteNumberGlyph.Renderer = Renderer;
            noteNumberGlyph.DoLayout();
            NoteNumbers.AddNoteGlyph(noteNumberGlyph, n);
        }
    }
}
