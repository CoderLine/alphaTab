using System;
using AlphaTab.Collections;
using AlphaTab.Model;
using AlphaTab.Platform;
using AlphaTab.Platform.Model;
using AlphaTab.Rendering.Utils;

namespace AlphaTab.Rendering.Glyphs
{
    public class BendNoteHeadGroupGlyph : ScoreNoteChordGlyphBase
    {
        private readonly FastDictionary<int, Glyph> _noteValueLookup;

        private const int AccidentalPadding = 3;
        private AccidentalGroupGlyph _accidentals;
        public bool IsEmpty { get; set; }
        public override BeamDirection Direction => BeamDirection.Up;
        public float NoteHeadOffset { get; set; }

        public BendNoteHeadGroupGlyph()
        {
            IsEmpty = true;
            _accidentals = new AccidentalGroupGlyph();
            _noteValueLookup = new FastDictionary<int, Glyph>();
        }

        public float GetNoteValueY(int noteValue, bool aboveNote = false)
        {
            if (_noteValueLookup.ContainsKey(noteValue))
            {
                return Y + _noteValueLookup[noteValue].Y + (aboveNote ? -(NoteHeadGlyph.NoteHeadHeight * NoteHeadGlyph.GraceScale * Scale) / 2 : 0);
            }
            return 0;
        }

        public float GetNoteX(int noteValue, bool onMiddle = true)
        {
            if (_noteValueLookup.ContainsKey(noteValue))
            {
                var n = _noteValueLookup[noteValue];
                var pos = X + n.X;
                if (onMiddle)
                {
                    pos += n.Width / 2.0f;
                }
                return pos;
            }
            return 0;
        }

        public void AddGlyph(int noteValue)
        {
            var sr = (ScoreBarRenderer)Renderer;
            var noteHeadGlyph = new NoteHeadGlyph(0, 0, Duration.Quarter, true);
            var accidental = sr.AccidentalHelper.ApplyAccidentalForValue(noteValue);
            var line = sr.AccidentalHelper.GetNoteLineForValue(noteValue);
            noteHeadGlyph.Y = sr.GetScoreY(line);

            switch (accidental)
            {
                case AccidentalType.Natural:
                    _accidentals.AddGlyph(new NaturalizeGlyph(0, noteHeadGlyph.Y, true));
                    break;
                case AccidentalType.Sharp:
                    _accidentals.AddGlyph(new SharpGlyph(0, noteHeadGlyph.Y, true));
                    break;
                case AccidentalType.Flat:
                    _accidentals.AddGlyph(new FlatGlyph(0, noteHeadGlyph.Y, true));
                    break;
            }

            _noteValueLookup[noteValue] = noteHeadGlyph;
            Add(noteHeadGlyph, line);

            IsEmpty = false;
        }

        public override void DoLayout()
        {
            if (!_accidentals.IsEmpty)
            {
                _accidentals.Renderer = Renderer;
                _accidentals.DoLayout();
                NoteStartX = _accidentals.Width + AccidentalPadding * Scale;
            }
            else
            {
                NoteStartX = 0;
            }

            base.DoLayout();

            NoteHeadOffset = NoteStartX + (Width - NoteStartX) / 2;

        }

        public override void Paint(float cx, float cy, ICanvas canvas)
        {
            if (!_accidentals.IsEmpty)
            {
                _accidentals.Paint(cx + X, cy + Y, canvas);
            }

            base.Paint(cx, cy, canvas);
        }
    }
}