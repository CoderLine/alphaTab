using System;
using AlphaTab.Collections;
using AlphaTab.Model;
using AlphaTab.Platform;
using AlphaTab.Platform.Model;
using AlphaTab.Rendering.Utils;

namespace AlphaTab.Rendering.Glyphs
{
    class BendNoteHeadGroupGlyph : ScoreNoteChordGlyphBase
    {
        private readonly bool _showParenthesis;
        private readonly FastDictionary<int, Glyph> _noteValueLookup;

        private const int ElementPadding = 2;
        private AccidentalGroupGlyph _accidentals;
        private GhostNoteContainerGlyph _preNoteParenthesis;
        private GhostNoteContainerGlyph _postNoteParenthesis;
        public bool IsEmpty { get; set; }
        public override BeamDirection Direction => BeamDirection.Up;
        public float NoteHeadOffset { get; set; }

        public BendNoteHeadGroupGlyph(bool showParenthesis = false)
        {
            _showParenthesis = showParenthesis;
            IsEmpty = true;
            _accidentals = new AccidentalGroupGlyph();
            _noteValueLookup = new FastDictionary<int, Glyph>();
            if (showParenthesis)
            {
                _preNoteParenthesis = new GhostNoteContainerGlyph(true);
                _postNoteParenthesis = new GhostNoteContainerGlyph(false);
            }
        }

        public float GetNoteValueY(int noteValue, bool aboveNote = false)
        {
            if (_noteValueLookup.ContainsKey(noteValue))
            {
                return Y + _noteValueLookup[noteValue].Y + (aboveNote ? -(NoteHeadGlyph.NoteHeadHeight * NoteHeadGlyph.GraceScale * Scale) / 2 : 0);
            }
            return 0;
        }

        public bool ContainsNoteValue(int noteValue)
        {
            return _noteValueLookup.ContainsKey(noteValue);
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

        public void AddGlyph(int noteValue, bool quarterBend = false)
        {
            var sr = (ScoreBarRenderer)Renderer;
            var noteHeadGlyph = new NoteHeadGlyph(0, 0, Duration.Quarter, sr.Settings.SmallGraceTabNotes);
            var accidental = sr.AccidentalHelper.ApplyAccidentalForValue(noteValue, quarterBend);
            var line = sr.AccidentalHelper.GetNoteLineForValue(noteValue);
            noteHeadGlyph.Y = sr.GetScoreY(line);

            if (_showParenthesis)
            {
                _preNoteParenthesis.Renderer = Renderer;
                _postNoteParenthesis.Renderer = Renderer;
                _preNoteParenthesis.AddParenthesisOnLine(line, true);
                _postNoteParenthesis.AddParenthesisOnLine(line, true);
            }

            if (accidental != AccidentalType.None)
            {
                _accidentals.AddGlyph(new AccidentalGlyph(0, noteHeadGlyph.Y, accidental, true));
            }

            _noteValueLookup[noteValue] = noteHeadGlyph;
            Add(noteHeadGlyph, line);

            IsEmpty = false;
        }

        public override void DoLayout()
        {
            var x = 0f;

            if (_showParenthesis)
            {
                _preNoteParenthesis.X = x;
                _preNoteParenthesis.Renderer = Renderer;
                _preNoteParenthesis.DoLayout();
                x += _preNoteParenthesis.Width + ElementPadding * Scale;
            }

            if (!_accidentals.IsEmpty)
            {
                _accidentals.X = x;
                _accidentals.Renderer = Renderer;
                _accidentals.DoLayout();
                x += _accidentals.Width + ElementPadding * Scale;
            }

            NoteStartX = x;

            base.DoLayout();

            NoteHeadOffset = NoteStartX + (Width - NoteStartX) / 2;

            if (_showParenthesis)
            {
                _postNoteParenthesis.X = Width + ElementPadding * Scale;
                _postNoteParenthesis.Renderer = Renderer;
                _postNoteParenthesis.DoLayout();
                Width += _postNoteParenthesis.Width + ElementPadding * Scale;
            }

        }

        public override void Paint(float cx, float cy, ICanvas canvas)
        {
            var x = 0f;
            if (!_accidentals.IsEmpty) x = _accidentals.X;
            else if (_showParenthesis) x = _preNoteParenthesis.X;

            //canvas.Color = Color.Random();
            //canvas.FillRect(cx + X, cy + Y, Width, 10);
            //canvas.Color = Renderer.Resources.MainGlyphColor;

            if (!_accidentals.IsEmpty)
            {
                _accidentals.Paint(cx + X, cy + Y, canvas);
            }

            if (_showParenthesis)
            {
                _preNoteParenthesis.Paint(cx + X, cy + Y, canvas);
                _postNoteParenthesis.Paint(cx + X, cy + Y, canvas);
            }

            base.Paint(cx, cy, canvas);
        }

    }
}