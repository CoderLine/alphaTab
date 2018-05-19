using AlphaTab.Collections;
using AlphaTab.Model;
using AlphaTab.Platform;
using AlphaTab.Platform.Model;
using AlphaTab.Rendering.Utils;

namespace AlphaTab.Rendering.Glyphs
{
    public class ScoreBendGlyph : ScoreHelperNotesBaseGlyph
    {
        private readonly Beat _beat;
        private FastList<Note> _notes;
        private BendNoteHeadGroupGlyph _endNoteGlyph;
        private BendNoteHeadGroupGlyph _middleNoteGlyph;

        public ScoreBendGlyph(Beat beat)
        {
            _beat = beat;
            _notes = new FastList<Note>();
            _middleNoteGlyph = null;
            _endNoteGlyph = null;
        }

        public void AddBends(Note note)
        {
            _notes.Add(note);
            if (note.IsTieOrigin)
            {
                return;
            }

            switch (note.BendType)
            {
                case BendType.Bend:
                case BendType.PrebendRelease:
                case BendType.PrebendBend:
                    {
                        BendNoteHeadGroupGlyph endGlyphs = _endNoteGlyph;
                        if (endGlyphs == null)
                        {
                            endGlyphs = _endNoteGlyph = new BendNoteHeadGroupGlyph();
                            endGlyphs.Renderer = Renderer;
                            _bendNoteHeads.Add(endGlyphs);
                        }

                        var lastBendPoint = note.BendPoints[note.BendPoints.Count - 1];
                        endGlyphs.AddGlyph(GetBendNoteValue(note, lastBendPoint), (lastBendPoint.Value % 2) != 0);
                    }

                    break;
                case BendType.Release:
                    {
                        if (!note.IsTieOrigin)
                        {
                            BendNoteHeadGroupGlyph endGlyphs = _endNoteGlyph;
                            if (endGlyphs == null)
                            {
                                endGlyphs = _endNoteGlyph = new BendNoteHeadGroupGlyph();
                                endGlyphs.Renderer = Renderer;
                                _bendNoteHeads.Add(endGlyphs);
                            }

                            var lastBendPoint = note.BendPoints[note.BendPoints.Count - 1];
                            endGlyphs.AddGlyph(GetBendNoteValue(note, lastBendPoint), (lastBendPoint.Value % 2) != 0);
                        }
                    }

                    break;
                case BendType.BendRelease:
                    {
                        BendNoteHeadGroupGlyph middleGlyphs = _middleNoteGlyph;
                        if (middleGlyphs == null)
                        {
                            middleGlyphs = _middleNoteGlyph = new BendNoteHeadGroupGlyph();
                            middleGlyphs.Renderer = Renderer;
                            _bendNoteHeads.Add(middleGlyphs);
                        }
                        var middleBendPoint = note.BendPoints[1];
                        middleGlyphs.AddGlyph(GetBendNoteValue(note, note.BendPoints[1]), (middleBendPoint.Value % 2) != 0);

                        BendNoteHeadGroupGlyph endGlyphs = _endNoteGlyph;
                        if (endGlyphs == null)
                        {
                            endGlyphs = _endNoteGlyph = new BendNoteHeadGroupGlyph();
                            endGlyphs.Renderer = Renderer;
                            _bendNoteHeads.Add(endGlyphs);
                        }
                        var lastBendPoint = note.BendPoints[note.BendPoints.Count - 1];
                        endGlyphs.AddGlyph(GetBendNoteValue(note, lastBendPoint), (lastBendPoint.Value % 2) != 0);
                    }

                    break;
            }
        }

        public override void Paint(float cx, float cy, ICanvas canvas)
        {
            // Draw note heads
            var startNoteRenderer = (ScoreBarRenderer)Renderer.ScoreRenderer.Layout.GetRendererForBar(Renderer.Staff.StaveId, _beat.Voice.Bar);
            var startX = cx + startNoteRenderer.X + startNoteRenderer.GetBeatX(_beat, BeatXPosition.MiddleNotes);
            var endBeatX = cx + startNoteRenderer.X;
            if (_beat.Index == _beat.Voice.Beats.Count - 1)
            {
                endBeatX += startNoteRenderer.PostBeatGlyphsStart;
            }
            else
            {
                endBeatX += startNoteRenderer.GetBeatX(_beat, BeatXPosition.EndBeat);
            }
            endBeatX -= EndPadding * Scale;

            var middleX = (startX + endBeatX) / 2;

            if (_middleNoteGlyph != null)
            {
                _middleNoteGlyph.X = middleX - _bendNoteHeads[0].NoteHeadOffset;
                _middleNoteGlyph.Y = cy + startNoteRenderer.Y;
                _middleNoteGlyph.Paint(0, 0, canvas);
            }

            if (_endNoteGlyph != null)
            {
                _endNoteGlyph.X = endBeatX - _bendNoteHeads[0].NoteHeadOffset;
                _endNoteGlyph.Y = cy + startNoteRenderer.Y;
                _endNoteGlyph.Paint(0, 0, canvas);
            }

            _notes.Sort((a, b) => b.RealValueWithEffects - a.RealValueWithEffects);

            var directionBeat = _beat.GraceType == GraceType.BendGrace ? _beat.NextBeat : _beat;
            var direction = _notes.Count == 1 ? GetBeamDirection(directionBeat, startNoteRenderer) : BeamDirection.Up;

            // draw slurs
            for (var i = 0; i < _notes.Count; i++)
            {
                var note = _notes[i];
                if (i > 0 && i >= _notes.Count / 2)
                {
                    direction = BeamDirection.Down;
                }

                var startY = cy + startNoteRenderer.Y + startNoteRenderer.GetNoteY(note, true);
                var heightOffset = (NoteHeadGlyph.NoteHeadHeight * Scale * NoteHeadGlyph.GraceScale) * 0.5f;
                if (direction == BeamDirection.Down)
                {
                    startY += NoteHeadGlyph.NoteHeadHeight * Scale;
                }

                var slurText = note.BendStyle == BendStyle.Gradual ? "grad." : "";

                if (note.IsTieOrigin)
                {
                    var endNote = note.TieDestination;
                    var endNoteRenderer = endNote == null
                        ? null
                        : Renderer.ScoreRenderer.Layout.GetRendererForBar(Renderer.Staff.StaveId,
                            endNote.Beat.Voice.Bar);

                    // if we have a line break we draw only a line until the end
                    if (endNoteRenderer == null || endNoteRenderer.Staff != startNoteRenderer.Staff)
                    {
                        var endX = cx + startNoteRenderer.X + startNoteRenderer.Width;
                        var noteValueToDraw = note.TieDestination.RealValue;

                        var accidental =
                            startNoteRenderer.AccidentalHelper.ApplyAccidentalForValue(noteValueToDraw, false);
                        var endY = cy + startNoteRenderer.Y +
                                   startNoteRenderer.GetScoreY(
                                       startNoteRenderer.AccidentalHelper.GetNoteLineForValue(noteValueToDraw));

                        DrawBendSlur(canvas, startX, startY, endX, endY, direction == BeamDirection.Down, Scale,
                            slurText);
                    }
                    // otherwise we draw a line to the target note
                    else
                    {
                        var endX = cx + endNoteRenderer.X +
                                   endNoteRenderer.GetBeatX(endNote.Beat, BeatXPosition.MiddleNotes);
                        var endY = cy + endNoteRenderer.Y + endNoteRenderer.GetNoteY(endNote, true);
                        if (direction == BeamDirection.Down)
                        {
                            endY += NoteHeadGlyph.NoteHeadHeight * Scale;
                        }

                        DrawBendSlur(canvas, startX, startY, endX, endY, direction == BeamDirection.Down, Scale,
                            slurText);
                    }

                    switch (note.BendType)
                    {
                        case BendType.Prebend:
                        case BendType.PrebendBend:
                        case BendType.PrebendRelease:
                            var preX = cx + startNoteRenderer.X +
                                       startNoteRenderer.GetBeatX(note.Beat, BeatXPosition.PreNotes);
                            preX += ((ScoreBeatPreNotesGlyph) startNoteRenderer.GetBeatContainer(note.Beat).PreNotes)
                                .PrebendNoteHeadOffset;

                            var preY = cy + startNoteRenderer.Y +
                                       startNoteRenderer.GetScoreY(
                                           startNoteRenderer.AccidentalHelper.GetNoteLineForValue(note.RealValue)) +
                                       heightOffset;

                            DrawBendSlur(canvas, preX, preY, startX, startY, direction == BeamDirection.Down, Scale);
                            break;
                    }
                }
                else
                {
                    if (direction == BeamDirection.Up) heightOffset = -heightOffset;
                    int endValue;
                    float endY;

                    switch (note.BendType)
                    {
                        case BendType.Bend:
                            endValue = GetBendNoteValue(note, note.BendPoints[note.BendPoints.Count - 1]);
                            endY = _endNoteGlyph.GetNoteValueY(endValue) + heightOffset;
                            DrawBendSlur(canvas, startX, startY, endBeatX, endY, direction == BeamDirection.Down, Scale,
                                slurText);

                            break;
                        case BendType.BendRelease:
                            var middleValue = GetBendNoteValue(note, note.BendPoints[1]);
                            var middleY = _middleNoteGlyph.GetNoteValueY(middleValue) + heightOffset;
                            DrawBendSlur(canvas, startX, startY, middleX, middleY, direction == BeamDirection.Down,
                                Scale, slurText);

                            endValue = GetBendNoteValue(note, note.BendPoints[note.BendPoints.Count - 1]);
                            endY = _endNoteGlyph.GetNoteValueY(endValue) + heightOffset;
                            DrawBendSlur(canvas, middleX, middleY, endBeatX, endY, direction == BeamDirection.Down,
                                Scale, slurText);

                            break;
                        case BendType.Release:
                            if (_bendNoteHeads.Count > 0)
                            {
                                endValue = GetBendNoteValue(note, note.BendPoints[note.BendPoints.Count - 1]);
                                endY = _bendNoteHeads[0].GetNoteValueY(endValue) + heightOffset;
                                DrawBendSlur(canvas, startX, startY, endBeatX, endY, direction == BeamDirection.Down,
                                    Scale, slurText);
                            }

                            break;
                        case BendType.Prebend:
                        case BendType.PrebendBend:
                        case BendType.PrebendRelease:

                            var preX = cx + startNoteRenderer.X +
                                       startNoteRenderer.GetBeatX(note.Beat, BeatXPosition.PreNotes);
                            preX += ((ScoreBeatPreNotesGlyph) startNoteRenderer.GetBeatContainer(note.Beat).PreNotes)
                                .PrebendNoteHeadOffset;

                            var preY = cy + startNoteRenderer.Y +
                                       startNoteRenderer.GetScoreY(
                                           startNoteRenderer.AccidentalHelper.GetNoteLineForValue(note.RealValue)) +
                                       heightOffset;

                            DrawBendSlur(canvas, preX, preY, startX, startY, direction == BeamDirection.Down, Scale);

                            if (_bendNoteHeads.Count > 0)
                            {
                                endValue = GetBendNoteValue(note, note.BendPoints[note.BendPoints.Count - 1]);
                                endY = _bendNoteHeads[0].GetNoteValueY(endValue) + heightOffset;
                                DrawBendSlur(canvas, startX, startY, endBeatX, endY, direction == BeamDirection.Down,
                                    Scale, slurText);
                            }

                            break;
                    }
                }
            }
        }

        private int GetBendNoteValue(Note note, BendPoint bendPoint)
        {
            // NOTE: bendpoints are in 1/4 tones, but the note values are in 1/2 notes. 
            return note.RealValue + bendPoint.Value / 2;
        }

    }
}