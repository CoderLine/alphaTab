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
using AlphaTab.Rendering.Utils;

namespace AlphaTab.Rendering.Glyphs
{
    public class ScoreLegatoGlyph : TieGlyph
    {
        public ScoreLegatoGlyph(Beat startBeat, Beat endBeat, bool forEnd = false)
            : base(startBeat, endBeat, forEnd)
        {
        }

        public override void DoLayout()
        {
            base.DoLayout();
            YOffset = (NoteHeadGlyph.NoteHeadHeight/2);
        }

        protected override BeamDirection GetBeamDirection(Beat beat, BarRendererBase noteRenderer)
        {
            if (beat.IsRest)
            {
                return BeamDirection.Up;
            }

            // invert direction (if stems go up, ties go down to not cross them)
            switch (((ScoreBarRenderer)noteRenderer).GetBeatDirection(beat))
            {
                case BeamDirection.Up:
                    return BeamDirection.Down;
                case BeamDirection.Down:
                default:
                    return BeamDirection.Up;
            }
        }

        protected override float GetStartY(BarRendererBase noteRenderer, BeamDirection direction)
        {
            if (StartBeat.IsRest)
            {
                // below all lines
                return ((ScoreBarRenderer)noteRenderer).GetScoreY(9);
            }

            switch (direction)
            {
                case BeamDirection.Up:
                    // below lowest note
                    return noteRenderer.GetNoteY(StartBeat.MinNote);
                default:
                    return noteRenderer.GetNoteY(StartBeat.MaxNote);
            }
        }

        protected override float GetEndY(BarRendererBase noteRenderer, BeamDirection direction)
        {
            if (EndBeat.IsRest)
            {
                switch (direction)
                {
                    case BeamDirection.Up:
                        return ((ScoreBarRenderer)noteRenderer).GetScoreY(9);
                    default:
                        return ((ScoreBarRenderer)noteRenderer).GetScoreY(0);
                }
            }

            switch (direction)
            {
                case BeamDirection.Up:
                    // below lowest note
                    return ((ScoreBarRenderer)noteRenderer).GetNoteY(EndBeat.MinNote);
                default:
                    return ((ScoreBarRenderer)noteRenderer).GetNoteY(EndBeat.MaxNote);
            }
        }

        protected override float GetStartX(BarRendererBase noteRenderer)
        {
            if (StartBeat.IsRest)
            {
                return noteRenderer.GetBeatX(StartBeat);
            }
            else
            {
                return noteRenderer.GetNoteX(StartBeat.MinNote);
            }
        }

        protected override float GetEndX(BarRendererBase noteRenderer)
        {
            if (EndBeat.IsRest)
            {
                return noteRenderer.GetBeatX(EndBeat);
            }
            else
            {
                return noteRenderer.GetNoteX(EndBeat.MinNote, false);
            }
        }

    }
}