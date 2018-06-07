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
using System;
using AlphaTab.Collections;
using AlphaTab.Model;
using AlphaTab.Platform;
using AlphaTab.Platform.Model;
using AlphaTab.Rendering.Utils;

namespace AlphaTab.Rendering.Glyphs
{
    public class ScoreNoteChordGlyph : ScoreNoteChordGlyphBase
    {
        private readonly FastDictionary<int, Glyph> _noteLookup;
        private Glyph _tremoloPicking;

        public FastDictionary<string, Glyph> BeatEffects { get; set; }

        public Beat Beat { get; set; }
        public BeamingHelper BeamingHelper { get; set; }

        public ScoreNoteChordGlyph()
        {
            BeatEffects = new FastDictionary<string, Glyph>();
            _noteLookup = new FastDictionary<int, Glyph>();
        }

        public override BeamDirection Direction
        {
            get
            {
                return BeamingHelper.Direction;
            }
        }

        public float GetNoteX(Note note, bool onEnd = true)
        {
            if (_noteLookup.ContainsKey(note.Id))
            {
                var n = _noteLookup[note.Id];
                var pos = X + n.X;
                if (onEnd)
                {
                    pos += n.Width;
                }
                return pos;
            }
            return 0;
        }

        public float GetNoteY(Note note, bool aboveNote = false)
        {
            if (_noteLookup.ContainsKey(note.Id))
            {
                return Y + _noteLookup[note.Id].Y + (aboveNote ? -(NoteHeadGlyph.NoteHeadHeight * Scale) / 2 : 0);
            }
            return 0;
        }

        public void AddNoteGlyph(Glyph noteGlyph, Note note, int noteLine)
        {
            base.Add(noteGlyph, noteLine);
            _noteLookup[note.Id] = noteGlyph;
        }

        public void UpdateBeamingHelper(float cx)
        {
            if (BeamingHelper != null)
            {
                BeamingHelper.RegisterBeatLineX(ScoreBarRenderer.StaffId, Beat, cx + X + UpLineX, cx + X + DownLineX);
            }
        }

        public override void DoLayout()
        {
            base.DoLayout();

            var direction = Direction;
            foreach (var effectKey in BeatEffects)
            {
                var effect = BeatEffects[effectKey];
                effect.Renderer = Renderer;
                effect.DoLayout();
            }

            if (Beat.IsTremolo)
            {
                int offset;
                var baseNote = direction == BeamDirection.Up ? MinNote : MaxNote;
                var tremoloX = direction == BeamDirection.Up ? DisplacedX : 0;
                var speed = Beat.TremoloSpeed.Value;
                switch (speed)
                {
                    case Duration.ThirtySecond:
                        offset = direction == BeamDirection.Up ? -15 : 15;
                        break;
                    case Duration.Sixteenth:
                        offset = direction == BeamDirection.Up ? -12 : 15;
                        break;
                    case Duration.Eighth:
                        offset = direction == BeamDirection.Up ? -10 : 10;
                        break;
                    default:
                        offset = direction == BeamDirection.Up ? -10 : 15;
                        break;
                }

                _tremoloPicking = new TremoloPickingGlyph(tremoloX, baseNote.Glyph.Y + offset * Scale, Beat.TremoloSpeed.Value);
                _tremoloPicking.Renderer = Renderer;
                _tremoloPicking.DoLayout();
            }
        }

        public override void Paint(float cx, float cy, ICanvas canvas)
        {
            // TODO: this method seems to be quite heavy according to the profiler, why?
            var scoreRenderer = (ScoreBarRenderer)Renderer;

            //
            // Note Effects only painted once
            //
            var effectY = BeamingHelper.Direction == BeamDirection.Up
                            ? scoreRenderer.GetScoreY(MaxNote.Line, 1.5f * NoteHeadGlyph.NoteHeadHeight)
                            : scoreRenderer.GetScoreY(MinNote.Line, -1.0f * NoteHeadGlyph.NoteHeadHeight);
            // TODO: take care of actual glyph height
            var effectSpacing = (BeamingHelper.Direction == BeamDirection.Up)
                            ? 7 * Scale
                            : -7 * Scale;

            foreach (var effectKey in BeatEffects)
            {
                var g = BeatEffects[effectKey];
                g.Y = effectY;
                g.X = Width / 2;
                g.Paint(cx + X, cy + Y, canvas);
                effectY += effectSpacing;
            }

            base.Paint(cx, cy, canvas);

            if (_tremoloPicking != null)
            {
                _tremoloPicking.Paint(cx, cy, canvas);
            }
        }
    }
}
