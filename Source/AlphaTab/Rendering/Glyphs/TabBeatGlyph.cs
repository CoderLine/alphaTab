﻿using AlphaTab.Model;

namespace AlphaTab.Rendering.Glyphs
{
    internal class TabBeatGlyph : BeatOnNoteGlyphBase
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
                var isGrace = Renderer.Settings.Notation.SmallGraceTabNotes &&
                              Container.Beat.GraceType != GraceType.None;
                NoteNumbers = new TabNoteChordGlyph(0, 0, isGrace);
                NoteNumbers.Beat = Container.Beat;
                NoteNumbers.BeamingHelper = BeamingHelper;
                foreach (var note in Container.Beat.Notes)
                {
                    if (note.IsVisible)
                    {
                        CreateNoteGlyph(note);
                    }
                }

                AddGlyph(NoteNumbers);

                //
                // Whammy Bar
                if (Container.Beat.HasWhammyBar)
                {
                    var whammy = new TabWhammyBarGlyph(Container.Beat);
                    whammy.Renderer = Renderer;
                    whammy.DoLayout();

                    Container.Ties.Add(whammy);
                }

                //
                // Tremolo Picking
                if (Container.Beat.IsTremolo && !NoteNumbers.BeatEffects.ContainsKey("Tremolo"))
                {
                    var offset = 0;
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

                    NoteNumbers.BeatEffects["Tremolo"] = new TremoloPickingGlyph(5 * Scale,
                        offset * Scale,
                        Container.Beat.TremoloSpeed.Value);
                }

                //
                // Note dots
                //
                if (Container.Beat.Dots > 0 && tabRenderer.Settings.Notation.RhythmMode != TabRhythmMode.Hidden)
                {
                    AddGlyph(new SpacingGlyph(0, 0, 5 * Scale));
                    for (var i = 0; i < Container.Beat.Dots; i++)
                    {
                        AddGlyph(new CircleGlyph(0,
                            tabRenderer.LineOffset * tabRenderer.Bar.Staff.Tuning.Length +
                            tabRenderer.Settings.Notation.RhythmHeight * tabRenderer.Scale,
                            1.5f * Scale));
                    }
                }
            }
            else
            {
                var line = 0f;
                var offset = 0;

                switch (Container.Beat.Duration)
                {
                    case Duration.QuadrupleWhole:
                        line = 3;
                        break;
                    case Duration.DoubleWhole:
                        line = 3;
                        break;
                    case Duration.Whole:
                        line = 2;
                        break;
                    case Duration.Half:
                        line = 3;
                        break;
                    case Duration.Quarter:
                        line = 3;
                        break;
                    case Duration.Eighth:
                        line = 2;
                        offset = 5;
                        break;
                    case Duration.Sixteenth:
                        line = 2;
                        offset = 5;
                        break;
                    case Duration.ThirtySecond:
                        line = 3;
                        break;
                    case Duration.SixtyFourth:
                        line = 3;
                        break;
                    case Duration.OneHundredTwentyEighth:
                        line = 3;
                        break;
                    case Duration.TwoHundredFiftySixth:
                        line = 3;
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
            if (Glyphs == null)
            {
                return;
            }

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

            if (Container.Beat.IsEmpty)
            {
                CenterX = Width / 2;
            }
            else if (Container.Beat.IsRest)
            {
                CenterX = RestGlyph.X + RestGlyph.Width / 2;
            }
            else
            {
                CenterX = NoteNumbers.X + NoteNumbers.NoteStringWidth / 2;
            }
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
            var l = n.Beat.Voice.Bar.Staff.Tuning.Length - n.String + 1;
            noteNumberGlyph.Y = tr.GetTabY(l, -2);
            noteNumberGlyph.Renderer = Renderer;
            noteNumberGlyph.DoLayout();
            NoteNumbers.AddNoteGlyph(noteNumberGlyph, n);
        }
    }
}
