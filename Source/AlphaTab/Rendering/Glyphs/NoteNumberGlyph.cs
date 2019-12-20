using AlphaTab.Model;
using AlphaTab.Platform;
using AlphaTab.Rendering.Utils;

namespace AlphaTab.Rendering.Glyphs
{
    internal class NoteNumberGlyph : Glyph
    {
        private readonly Note _note;
        private string _noteString;
        private string _trillNoteString;
        private float _trillNoteStringWidth;

        public bool IsEmpty { get; set; }
        public float Height { get; set; }
        public float NoteStringWidth { get; set; }

        public NoteNumberGlyph(float x, float y, Note note)
            : base(x, y)
        {
            _note = note;
        }

        public override void DoLayout()
        {
            var n = _note;

            double fret = n.Fret - n.Beat.Voice.Bar.Staff.TranspositionPitch;
            if (n.HarmonicType == HarmonicType.Natural && n.HarmonicValue != 0)
            {
                fret = n.HarmonicValue - n.Beat.Voice.Bar.Staff.TranspositionPitch;
            }

            if (!n.IsTieDestination)
            {
                _noteString = n.IsDead ? "x" : fret.ToString();
                if (n.IsGhost)
                {
                    _noteString = "(" + _noteString + ")";
                }
                else if (n.HarmonicType == HarmonicType.Natural)
                {
                    // only first decimal char
                    var i = _noteString.IndexOf('.');
                    if (i >= 0)
                    {
                        _noteString = _noteString.Substring(0, i + 2);
                    }

                    _noteString = "<" + _noteString + ">";
                }
            }
            else if (n.Beat.Index == 0 ||
                     ((n.BendType == BendType.Bend || n.BendType == BendType.BendRelease) && Renderer.Settings.Notation.ShowTabNoteOnTiedBend))
            {
                _noteString = "(" + (n.TieOrigin.Fret - n.Beat.Voice.Bar.Staff.TranspositionPitch) + ")";
            }
            else
            {
                _noteString = "";
            }

            if (n.IsTrill)
            {
                _trillNoteString = "(" + (n.TrillFret - n.Beat.Voice.Bar.Staff.TranspositionPitch) + ")";
            }
            else if (!n.HarmonicValue.IsAlmostEqualTo(0))
            {
                switch (n.HarmonicType)
                {
                    case HarmonicType.Artificial:
                    case HarmonicType.Pinch:
                    case HarmonicType.Tap:
                    case HarmonicType.Semi:
                    case HarmonicType.Feedback:

                        var s = (fret + n.HarmonicValue).ToString();
                        // only first decimal char
                        var i = s.IndexOf('.');
                        if (i >= 0)
                        {
                            s = s.Substring(0, i + 2);
                        }

                        _trillNoteString = "<" + s + ">";
                        break;
                    default:
                        _trillNoteString = "";
                        break;
                }
            }
            else
            {
                _trillNoteString = "";
            }

            IsEmpty = string.IsNullOrEmpty(_noteString);
            if (!IsEmpty)
            {
                Renderer.ScoreRenderer.Canvas.Font = Renderer.Resources.TablatureFont;
                Width = NoteStringWidth = Renderer.ScoreRenderer.Canvas.MeasureText(_noteString);
                Height = Renderer.ScoreRenderer.Canvas.Font.Size;

                var hasTrill = !string.IsNullOrEmpty(_trillNoteString);
                if (hasTrill)
                {
                    Renderer.ScoreRenderer.Canvas.Font = Renderer.Resources.GraceFont;
                    _trillNoteStringWidth = 3 * Scale + Renderer.ScoreRenderer.Canvas.MeasureText(_trillNoteString);
                    Width += _trillNoteStringWidth;
                }
            }
        }

        public override void Paint(float cx, float cy, ICanvas canvas)
        {
            if (IsEmpty)
            {
                return;
            }

            var textWidth = NoteStringWidth + _trillNoteStringWidth;
            var x = cx + X + (Width - textWidth) / 2;

            var prevFont = Renderer.ScoreRenderer.Canvas.Font;
            Renderer.ScoreRenderer.Canvas.Font = Renderer.Resources.GraceFont;
            canvas.FillText(_trillNoteString, x + NoteStringWidth + 3 * Scale, cy + Y);
            Renderer.ScoreRenderer.Canvas.Font = prevFont;

            canvas.FillText(_noteString, x, cy + Y);

            if (Renderer.Settings.Core.IncludeNoteBounds)
            {
                var noteBounds = new NoteBounds();
                noteBounds.Note = _note;
                noteBounds.NoteHeadBounds = new Bounds
                {
                    X = cx + X,
                    Y = cy + Y,
                    W = Width,
                    H = Height
                };
                Renderer.ScoreRenderer.BoundsLookup.AddNote(noteBounds);
            }
        }
    }
}
