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

using System;
using AlphaTab.Collections;
using AlphaTab.Model;
using AlphaTab.Platform;

namespace AlphaTab.Rendering.Glyphs
{
    public class ScoreBeatGlyph : BeatOnNoteGlyphBase
    {
        public ScoreNoteChordGlyph NoteHeads { get; set; }
        public ScoreRestGlyph RestGlyph { get; set; }

        public override void UpdateBeamingHelper()
        {
            if (NoteHeads != null)
            {
                NoteHeads.UpdateBeamingHelper(Container.X + X);
            }
            else if (RestGlyph != null)
            {
                RestGlyph.UpdateBeamingHelper(Container.X + X);
            }
        }

        public override void DoLayout()
        {
            // create glyphs
            var sr = (ScoreBarRenderer)Renderer;
            if (!Container.Beat.IsEmpty)
            {
                if (!Container.Beat.IsRest)
                {
                    //
                    // Note heads
                    //
                    NoteHeads = new ScoreNoteChordGlyph();
                    NoteHeads.Beat = Container.Beat;
                    NoteHeads.BeamingHelper = BeamingHelper;
                    foreach (var note in Container.Beat.Notes)
                    {
                        CreateNoteGlyph(note);
                    }
                    AddGlyph(NoteHeads);

                    //
                    // Note dots
                    //
                    if (Container.Beat.Dots > 0)
                    {
                        AddGlyph(new SpacingGlyph(0, 0, 5 * Scale));
                        for (var i = 0; i < Container.Beat.Dots; i++)
                        {
                            var group = new GlyphGroup(0, 0);
                            foreach (var note in Container.Beat.Notes)
                            {
                                CreateBeatDot(sr.GetNoteLine(note), group);
                            }
                            AddGlyph(group);
                        }
                    }
                }
                else
                {
                    var dotLine = 0;
                    var line = 0;
                    var offset = 0;

                    switch (Container.Beat.Duration)
                    {
                        case Duration.QuadrupleWhole:
                            line = 6;
                            dotLine = 5;
                            break;
                        case Duration.DoubleWhole:
                            line = 6;
                            dotLine = 5;
                            break;
                        case Duration.Whole:
                            line = 4;
                            dotLine = 5;
                            break;
                        case Duration.Half:
                            line = 6;
                            dotLine = 5;
                            break;
                        case Duration.Quarter:
                            line = 6;
                            offset = -2;
                            dotLine = 5;
                            break;
                        case Duration.Eighth:
                            line = 6;
                            dotLine = 5;
                            break;
                        case Duration.Sixteenth:
                            line = 6;
                            dotLine = 5;
                            break;
                        case Duration.ThirtySecond:
                            line = 6;
                            dotLine = 3;
                            break;
                        case Duration.SixtyFourth:
                            line = 6;
                            dotLine = 3;
                            break;
                        case Duration.OneHundredTwentyEighth:
                            line = 6;
                            dotLine = 3;
                            break;
                        case Duration.TwoHundredFiftySixth:
                            line = 6;
                            dotLine = 3;
                            break;
                    }

                    var y = sr.GetScoreY(line, offset);

                    RestGlyph = new ScoreRestGlyph(0, y, Container.Beat.Duration);
                    RestGlyph.Beat = Container.Beat;
                    RestGlyph.BeamingHelper = BeamingHelper;
                    AddGlyph(RestGlyph);

                    //
                    // Note dots
                    //
                    if (Container.Beat.Dots > 0)
                    {
                        AddGlyph(new SpacingGlyph(0, 0, 5 * Scale));
                        for (var i = 0; i < Container.Beat.Dots; i++)
                        {
                            var group = new GlyphGroup(0, 0);
                            CreateBeatDot(dotLine, group);
                            AddGlyph(group);
                        }
                    }
                }
            }

            base.DoLayout();
        }

        private void CreateBeatDot(int line, GlyphGroup group)
        {
            var sr = (ScoreBarRenderer)Renderer;
            group.AddGlyph(new CircleGlyph(0, sr.GetScoreY(line), 1.5f * Scale));
        }

        private static readonly FastDictionary<int, bool> NormalKeys;
        private static readonly FastDictionary<int, bool> XKeys;

        static ScoreBeatGlyph()
        {
            // ReSharper disable ForCanBeConvertedToForeach
            NormalKeys = new FastDictionary<int, bool>();
            var normalKeyNotes = new[] { 32, 34, 35, 36, 38, 39, 40, 41, 43, 45, 47, 48, 50, 55, 56, 58, 60, 61 };
            for (int i = 0; i < normalKeyNotes.Length; i++)
            {
                NormalKeys[normalKeyNotes[i]] = true;
            }
            XKeys = new FastDictionary<int, bool>();
            var xKeyNotes = new[] { 31, 33, 37, 42, 44, 54, 62, 63, 64, 65, 66 };
            for (int i = 0; i < xKeyNotes.Length; i++)
            {
                XKeys[xKeyNotes[i]] = true;
            }
            // ReSharper restore ForCanBeConvertedToForeach
        }

        private Glyph CreateNoteHeadGlyph(Note n)
        {
            var isGrace = Container.Beat.GraceType != GraceType.None;
            if (n.Beat.Voice.Bar.Staff.Track.IsPercussion)
            {
                var value = n.RealValue;

                if (value <= 30 || value >= 67 || NormalKeys.ContainsKey(value))
                {
                    return new NoteHeadGlyph(0, 0, Duration.Quarter, isGrace);
                }
                if (XKeys.ContainsKey(value))
                {
                    return new DrumSticksGlyph(0, 0, isGrace);
                }
                if (value == 46)
                {
                    return new HiHatGlyph(0, 0, isGrace);
                }
                if (value == 49 || value == 57)
                {
                    return new DiamondNoteHeadGlyph(0, 0, isGrace);
                }
                if (value == 52)
                {
                    return new ChineseCymbalGlyph(0, 0, isGrace);
                }
                if (value == 51 || value == 53 || value == 59)
                {
                    return new RideCymbalGlyph(0, 0, isGrace);
                }
                return new NoteHeadGlyph(0, 0, Duration.Quarter, isGrace);
            }
            if (n.IsDead)
            {
                return new DeadNoteHeadGlyph(0, 0, isGrace);
            }
            if (n.HarmonicType == HarmonicType.None)
            {
                return new NoteHeadGlyph(0, 0, n.Beat.Duration, isGrace);
            }
            return new DiamondNoteHeadGlyph(0, 0, isGrace);
        }

        private void CreateNoteGlyph(Note n)
        {
            var sr = (ScoreBarRenderer)Renderer;
            var noteHeadGlyph = CreateNoteHeadGlyph(n);

            // calculate y position
            var line = sr.GetNoteLine(n);

            noteHeadGlyph.Y = sr.GetScoreY(line);
            NoteHeads.AddNoteGlyph(noteHeadGlyph, n, line);

            if (n.IsStaccato && !NoteHeads.BeatEffects.ContainsKey("Staccato"))
            {
                NoteHeads.BeatEffects["Staccato"] = new CircleGlyph(0, 0, 1.5f);
            }

            if (n.Accentuated == AccentuationType.Normal && !NoteHeads.BeatEffects.ContainsKey("Accent"))
            {
                NoteHeads.BeatEffects["Accent"] = new AccentuationGlyph(0, 0, AccentuationType.Normal);
            }
            if (n.Accentuated == AccentuationType.Heavy && !NoteHeads.BeatEffects.ContainsKey("HAccent"))
            {
                NoteHeads.BeatEffects["HAccent"] = new AccentuationGlyph(0, 0, AccentuationType.Heavy);
            }
        }
    }
}
