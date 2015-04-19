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
    public class ScoreBeatPreNotesGlyph : BeatGlyphBase
    {
        public override void ApplyGlyphSpacing(float spacing)
        {
            base.ApplyGlyphSpacing(spacing);
            if (Glyphs == null) return;
            // add spacing at the beginning, this way the elements are closer to the note head
            for (int i = 0, j = Glyphs.Count; i < j; i++)
            {
                Glyphs[i].X += spacing;
            }
        }

        public override void DoLayout()
        {
            if (Container.Beat.BrushType != BrushType.None)
            {
                AddGlyph(new ScoreBrushGlyph(Container.Beat));
                AddGlyph(new SpacingGlyph(0, 0, 4 * Scale));
            }

            if (!Container.Beat.IsRest && !Container.Beat.Voice.Bar.Track.IsPercussion)
            {
                var accidentals = new AccidentalGroupGlyph();
                NoteLoop(n => CreateAccidentalGlyph(n, accidentals));
                AddGlyph(accidentals);
            }

            // a small padding
            AddGlyph(new SpacingGlyph(0, 0, 4 * (Container.Beat.GraceType != GraceType.None ? NoteHeadGlyph.GraceScale : 1) * Scale));

            base.DoLayout();
        }

        private void CreateAccidentalGlyph(Note n, AccidentalGroupGlyph accidentals)
        {
            var sr = (ScoreBarRenderer)Renderer;
            var accidental = sr.AccidentalHelper.ApplyAccidental(n);
            var noteLine = sr.GetNoteLine(n);
            var isGrace = Container.Beat.GraceType != GraceType.None;
            switch (accidental)
            {
                case AccidentalType.Sharp:
                    accidentals.AddGlyph(new SharpGlyph(0, sr.GetScoreY(noteLine), isGrace));
                    break;
                case AccidentalType.Flat:
                    accidentals.AddGlyph(new FlatGlyph(0, sr.GetScoreY(noteLine), isGrace));
                    break;
                case AccidentalType.Natural:
                    accidentals.AddGlyph(new NaturalizeGlyph(0, sr.GetScoreY(noteLine + 1), isGrace));
                    break;
            }
        }
    }
}
