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

namespace AlphaTab.Rendering.Glyphs
{
    public class TabBeatGlyph : BeatOnNoteGlyphBase
    {
        public TabNoteChordGlyph NoteNumbers { get; set; }
        public TabRestGlyph RestGlyph { get; set; }

        public override void DoLayout()
        {
            var tabRenderer = (TabBarRenderer)Renderer;
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

                    var whammyValueHeight = (WhammyBarGlyph.WhammyMaxOffset * Scale) / Beat.WhammyBarMaxValue;

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

                //
                // Note dots
                //
                if (Container.Beat.Dots > 0 && tabRenderer.RenderRhythm)
                {
                    AddGlyph(new SpacingGlyph(0, 0, 5 * Scale));
                    for (var i = 0; i < Container.Beat.Dots; i++)
                    {
                        AddGlyph(new CircleGlyph(0, tabRenderer.LineOffset * tabRenderer.Bar.Staff.Track.Tuning.Length + tabRenderer.RhythmHeight, 1.5f * Scale));
                    }
                }
            }
            else
            {
                var dotLine = 0f;
                var line = 0f;
                var offset = 0;

                switch (Container.Beat.Duration)
                {
                    case Duration.QuadrupleWhole:
                        line = 3;
                        dotLine = 2;
                        break;
                    case Duration.DoubleWhole:
                        line = 3;
                        dotLine = 2;
                        break;
                    case Duration.Whole:
                        line = 2;
                        dotLine = 2;
                        break;
                    case Duration.Half:
                        line = 3;
                        dotLine = 3;
                        break;
                    case Duration.Quarter:
                        line = 3;
                        dotLine = 2.5f;
                        break;
                    case Duration.Eighth:
                        line = 2;
                        dotLine = 2.5f;
                        offset = 5;
                        break;
                    case Duration.Sixteenth:
                        line = 2;
                        dotLine = 2.5f;
                        offset = 5;
                        break;
                    case Duration.ThirtySecond:
                        line = 3;
                        dotLine = 2.5f;
                        break;
                    case Duration.SixtyFourth:
                        line = 3;
                        dotLine = 2.5f;
                        break;
                    case Duration.OneHundredTwentyEighth:
                        line = 3;
                        dotLine = 2.5f;
                        break;
                    case Duration.TwoHundredFiftySixth:
                        line = 3;
                        dotLine = 2.5f;
                        break;
                }

                var y = tabRenderer.GetTabY(line, offset);

                RestGlyph = new TabRestGlyph(0, y, tabRenderer.ShowRests, Container.Beat.Duration);
                RestGlyph.Beat = Container.Beat;
                RestGlyph.BeamingHelper = BeamingHelper;
                AddGlyph(RestGlyph);

                //
                // Note dots
                //
                if (Container.Beat.Dots > 0 && tabRenderer.ShowRests)
                {
                    AddGlyph(new SpacingGlyph(0, 0, 5 * Scale));
                    for (var i = 0; i < Container.Beat.Dots; i++)
                    {
                        AddGlyph(new CircleGlyph(0, y, 1.5f * Scale));
                    }
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
