using System;
using AlphaTab.Model;
using AlphaTab.Platform;
using AlphaTab.Rendering.Utils;

namespace AlphaTab.Rendering.Glyphs
{
    public class ScoreBendGlyph : Glyph
    {
        private readonly Note _note;
        private const int SlurHeight = 11;
        public const int EndPadding = 4;

        public ScoreBendGlyph(Note n)
            : base(0, 0)
        {
            _note = n;
        }

        public override void Paint(float cx, float cy, ICanvas canvas)
        {
            switch (_note.BendType)
            {
                case BendType.None:
                case BendType.Custom:
                case BendType.Hold:
                    return;
            }

            var startNoteRenderer = (ScoreBarRenderer)Renderer.ScoreRenderer.Layout.GetRendererForBar(Renderer.Staff.StaveId, _note.Beat.Voice.Bar);

            var startY = cy + startNoteRenderer.Y + startNoteRenderer.GetNoteY(_note, true);
            var startX = cx + startNoteRenderer.X + startNoteRenderer.GetBeatX(_note.Beat, BeatXPosition.MiddleNotes);
            var direction = GetBeamDirection(_note.Beat, startNoteRenderer);

            if (_note.IsTieOrigin)
            {
                var endNote = _note.TieDestination;
                var endNoteRenderer = endNote == null ? null : Renderer.ScoreRenderer.Layout.GetRendererForBar(Renderer.Staff.StaveId, endNote.Beat.Voice.Bar);

                // if we have a line break we draw only a line until the end
                if (endNoteRenderer == null || endNoteRenderer.Staff != startNoteRenderer.Staff)
                {
                    var endX = cx + startNoteRenderer.X + startNoteRenderer.Width;
                    var noteValueToDraw = _note.TieDestination.RealValue;

                    var accidental = startNoteRenderer.AccidentalHelper.ApplyAccidentalForValue(noteValueToDraw);
                    var endY = cy + startNoteRenderer.Y + startNoteRenderer.GetScoreY(startNoteRenderer.AccidentalHelper.GetNoteLineForValue(noteValueToDraw));

                    DrawBendSlur(canvas, startX, startY, endX, endY, direction == BeamDirection.Down, Scale);
                }
                // otherwise we draw a line to the target note
                else
                {
                    var endX = cx + endNoteRenderer.X + endNoteRenderer.GetBeatX(endNote.Beat, BeatXPosition.MiddleNotes);
                    var endY = cy + endNoteRenderer.Y + endNoteRenderer.GetNoteY(endNote, true);
                    DrawBendSlur(canvas, startX, startY, endX, endY, direction == BeamDirection.Down, Scale);
                }
            }
            else
            {
                var endX = cx + startNoteRenderer.X;
                if (_note.Beat.Index == _note.Beat.Voice.Beats.Count - 1)
                {
                    endX += startNoteRenderer.Width;
                }
                else
                {
                    endX += startNoteRenderer.GetBeatX(_note.Beat, BeatXPosition.EndBeat);
                }
                endX -= EndPadding * Scale;

                float endY;
                AccidentalType accidental;
                Bounds noteHeadBounds;
                int noteValueToDraw;
                var heightOffsetFactor = direction == BeamDirection.Down ? -0.5f : 0.5f;

                switch (_note.BendType)
                {
                    case BendType.Bend:

                        // Draw slur to end bend
                        noteValueToDraw = GetBendNoteValue(_note.BendPoints[_note.BendPoints.Count - 1]);
                        accidental = startNoteRenderer.AccidentalHelper.ApplyAccidentalForValue(noteValueToDraw);
                        endY = cy + startNoteRenderer.Y + startNoteRenderer.GetScoreY(startNoteRenderer.AccidentalHelper.GetNoteLineForValue(noteValueToDraw));

                        noteHeadBounds = PaintNoteHead(endX, endY, accidental, canvas);
                        endX = noteHeadBounds.X + noteHeadBounds.W / 2f;

                        endY -= noteHeadBounds.H * heightOffsetFactor;

                        DrawBendSlur(canvas, startX, startY, endX, endY, direction == BeamDirection.Down, Scale);

                        break;
                    case BendType.BendRelease:

                        noteValueToDraw = GetBendNoteValue(_note.BendPoints[1]);
                        accidental = startNoteRenderer.AccidentalHelper.ApplyAccidentalForValue(noteValueToDraw);
                        var middleY = cy + startNoteRenderer.Y + startNoteRenderer.GetScoreY(startNoteRenderer.AccidentalHelper.GetNoteLineForValue(noteValueToDraw));

                        var middleX = (startX + endX) / 2;
                        noteHeadBounds = PaintNoteHead(middleX, middleY, accidental, canvas);
                        middleX = noteHeadBounds.X + noteHeadBounds.W / 2f;
                        middleY -= noteHeadBounds.H * heightOffsetFactor;
                        DrawBendSlur(canvas, startX, startY, middleX, middleY, direction == BeamDirection.Down, Scale);


                        noteValueToDraw = GetBendNoteValue(_note.BendPoints[_note.BendPoints.Count - 1]);
                        accidental = startNoteRenderer.AccidentalHelper.ApplyAccidentalForValue(noteValueToDraw);
                        endY = cy + startNoteRenderer.Y + startNoteRenderer.GetScoreY(startNoteRenderer.AccidentalHelper.GetNoteLineForValue(noteValueToDraw));

                        noteHeadBounds = PaintNoteHead(endX, endY, accidental, canvas);
                        endX = noteHeadBounds.X + noteHeadBounds.W / 2f;
                        endY -= noteHeadBounds.H * heightOffsetFactor;
                        DrawBendSlur(canvas, middleX, middleY, endX, endY, direction == BeamDirection.Down, Scale);

                        break;
                    case BendType.Prebend:

                        // TODO: slur from a prebeat glyph to current note

                        break;
                    case BendType.PrebendBend:

                        // TODO: slur from a prebeat glyph to current note

                        // Draw slur to end bend
                        noteValueToDraw = GetBendNoteValue(_note.BendPoints[_note.BendPoints.Count - 1]);
                        accidental = startNoteRenderer.AccidentalHelper.ApplyAccidentalForValue(noteValueToDraw);
                        endY = cy + startNoteRenderer.Y + startNoteRenderer.GetScoreY(startNoteRenderer.AccidentalHelper.GetNoteLineForValue(noteValueToDraw));

                        noteHeadBounds = PaintNoteHead(endX, endY, accidental, canvas);
                        endX = noteHeadBounds.X + noteHeadBounds.W / 2f;
                        endY -= noteHeadBounds.H * heightOffsetFactor;
                        DrawBendSlur(canvas, startX, startY, endX, endY, direction == BeamDirection.Down, Scale);


                        break;
                    case BendType.PrebendRelease:

                        // TODO: slur from a prebeat glyph to current note

                        // Draw slur to end bend
                        noteValueToDraw = GetBendNoteValue(_note.BendPoints[_note.BendPoints.Count - 1]);
                        accidental = startNoteRenderer.AccidentalHelper.ApplyAccidentalForValue(noteValueToDraw);
                        endY = cy + startNoteRenderer.Y + startNoteRenderer.GetScoreY(startNoteRenderer.AccidentalHelper.GetNoteLineForValue(noteValueToDraw));

                        noteHeadBounds = PaintNoteHead(endX, endY, accidental, canvas);
                        endX = noteHeadBounds.X + noteHeadBounds.W / 2f;
                        endY -= noteHeadBounds.H * heightOffsetFactor;

                        DrawBendSlur(canvas, startX, startY, endX, endY, direction == BeamDirection.Down, Scale);

                        break;
                }
            }
        }

        private int GetBendNoteValue(BendPoint bendPoint)
        {
            // NOTE: bendpoints are in 1/4 tones, but the note values are in 1/2 notes. 
            return _note.RealValue + bendPoint.Value / 2;
        }

        private Bounds PaintNoteHead(float endX, float endY, AccidentalType accidental, ICanvas canvas)
        {
            var bounds = new Bounds();
            var noteHead = new NoteHeadGlyph(0, 0, Duration.Quarter, true);
            noteHead.Renderer = Renderer;
            noteHead.DoLayout();
            bounds.X = endX - noteHead.Width;
            bounds.Y = endY;
            bounds.W = noteHead.Width;
            bounds.H = noteHead.Height;
            noteHead.Paint(bounds.X, bounds.Y, canvas);

            if (accidental != AccidentalType.None)
            {
                Glyph accidentalGlyph = null;
                switch (accidental)
                {
                    case AccidentalType.Natural:
                        accidentalGlyph = new NaturalizeGlyph(0, 0, true);
                        break;
                    case AccidentalType.Sharp:
                        accidentalGlyph = new SharpGlyph(0, 0, true);
                        break;
                    case AccidentalType.Flat:
                        accidentalGlyph = new FlatGlyph(0, 0, true);
                        break;
                }

                if (accidentalGlyph != null)
                {
                    accidentalGlyph.Renderer = Renderer;
                    accidentalGlyph.DoLayout();
                    accidentalGlyph.Paint(endX - noteHead.Width - accidentalGlyph.Width, endY, canvas);
                }
            }

            return bounds;
        }

        protected BeamDirection GetBeamDirection(Beat beat, ScoreBarRenderer noteRenderer)
        {
            // invert direction (if stems go up, ties go down to not cross them)
            switch (noteRenderer.GetBeatDirection(beat))
            {
                case BeamDirection.Up:
                    return BeamDirection.Down;
                case BeamDirection.Down:
                default:
                    return BeamDirection.Up;
            }
        }


        private void DrawBendSlur(ICanvas canvas, float x1, float y1, float x2, float y2, bool down, float scale)
        {
            var normalVectorX = (y2 - y1);
            var normalVectorY = (x2 - x1);
            var length = (float)Math.Sqrt((normalVectorX * normalVectorX) + (normalVectorY * normalVectorY));
            if (down)
                normalVectorX *= -1;
            else
                normalVectorY *= -1;

            // make to unit vector
            normalVectorX /= length;
            normalVectorY /= length;

            // center of connection
            // TODO: should be 1/3 
            var centerX = (x2 + x1) / 2;
            var centerY = (y2 + y1) / 2;

            var offset = SlurHeight * scale;
            var cp1X = centerX + (offset * normalVectorX);
            var cp1Y = centerY + (offset * normalVectorY);

            canvas.BeginPath();
            canvas.MoveTo(x1, y1);
            canvas.LineTo(cp1X, cp1Y);
            canvas.LineTo(x2, y2);
            canvas.Stroke();
        }

        public static string GetFractionSign(int steps)
        {
            switch (steps)
            {
                case 1:
                    return "¼";
                case 2:
                    return "½";
                case 3:
                    return "¾";
                default:
                    return steps + "/ 4";
            }
        }
    }
}