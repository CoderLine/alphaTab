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

namespace AlphaTab.Rendering.Glyphs
{
    public class ScoreBeatPreNotesGlyph : BeatGlyphBase
    {
        private BendNoteHeadGroupGlyph _prebends;
        public float PrebendNoteHeadOffset => _prebends.X + _prebends.NoteHeadOffset;

        public override void DoLayout()
        {
            if (!Container.Beat.IsRest)
            {
                var accidentals = new AccidentalGroupGlyph();
                var ghost = new GhostNoteContainerGlyph(true);
                ghost.Renderer = Renderer;
                _prebends = new BendNoteHeadGroupGlyph(true);
                _prebends.Renderer = Renderer;
                foreach (var note in Container.Beat.Notes)
                {
                    if (note.HasBend)
                    {
                        switch (note.BendType)
                        {
                            case BendType.PrebendBend:
                            case BendType.Prebend:
                            case BendType.PrebendRelease:
                                _prebends.AddGlyph(note.RealValue);
                                break;
                        }
                    }
                    CreateAccidentalGlyph(note, accidentals);
                    ghost.AddParenthesis(note);
                }

                if (!_prebends.IsEmpty)
                {
                    AddGlyph(_prebends);
                    AddGlyph(new SpacingGlyph(0, 0, 4 * (Container.Beat.GraceType != GraceType.None ? NoteHeadGlyph.GraceScale : 1) * Scale));
                }

                if (Container.Beat.BrushType != BrushType.None)
                {
                    AddGlyph(new ScoreBrushGlyph(Container.Beat));
                    AddGlyph(new SpacingGlyph(0, 0, 4 * Scale));
                }

                if (!ghost.IsEmpty)
                {
                    AddGlyph(ghost);
                    AddGlyph(new SpacingGlyph(0, 0, 4 * (Container.Beat.GraceType != GraceType.None ? NoteHeadGlyph.GraceScale : 1) * Scale));
                }

                if (!accidentals.IsEmpty)
                {
                    AddGlyph(accidentals);
                    AddGlyph(new SpacingGlyph(0, 0, 4 * (Container.Beat.GraceType != GraceType.None ? NoteHeadGlyph.GraceScale : 1) * Scale));
                }
            }

            base.DoLayout();
        }

        private void CreateAccidentalGlyph(Note n, AccidentalGroupGlyph accidentals)
        {
            var sr = (ScoreBarRenderer)Renderer;
            var accidental = sr.AccidentalHelper.ApplyAccidental(n);
            var noteLine = sr.GetNoteLine(n);
            var isGrace = Container.Beat.GraceType != GraceType.None;

            if (accidental != AccidentalType.None)
            {
                accidentals.AddGlyph(new AccidentalGlyph(0, sr.GetScoreY(noteLine), accidental, isGrace));
            }
        }
    }
}
