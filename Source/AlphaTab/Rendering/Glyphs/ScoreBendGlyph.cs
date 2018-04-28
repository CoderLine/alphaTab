using AlphaTab.Model;
using AlphaTab.Platform;
using AlphaTab.Rendering.Utils;

namespace AlphaTab.Rendering.Glyphs
{
    public class ScoreBendGlyph : ScoreHelperNotesBaseGlyph
    {
        private readonly Note _note;

        public ScoreBendGlyph(Note n)
        {
            _note = n;
        }

        public override void DoLayout()
        {
            switch (_note.BendType)
            {
                case BendType.None:
                case BendType.Custom:
                case BendType.Hold:
                    return;
            }

            if (_note.IsTieOrigin)
            {
                return;
            }

            switch (_note.BendType)
            {
                case BendType.Bend:
                case BendType.PrebendRelease:
                case BendType.PrebendBend:
                    {
                        var endGlyphs = new BendNoteHeadGroupGlyph();
                        endGlyphs.Renderer = Renderer;

                        var lastBendPoint = _note.BendPoints[_note.BendPoints.Count - 1];
                        endGlyphs.AddGlyph(GetBendNoteValue(lastBendPoint), (lastBendPoint.Value % 2) != 0);
                        endGlyphs.DoLayout();

                        _bendNoteHeads.Add(endGlyphs);
                    }

                    break;
                case BendType.Release:
                    {
                        if (!_note.IsTieOrigin)
                        {
                            var endGlyphs = new BendNoteHeadGroupGlyph();
                            endGlyphs.Renderer = Renderer;
                            var lastBendPoint = _note.BendPoints[_note.BendPoints.Count - 1];
                            endGlyphs.AddGlyph(GetBendNoteValue(lastBendPoint), (lastBendPoint.Value % 2) != 0);
                            endGlyphs.DoLayout();

                            _bendNoteHeads.Add(endGlyphs);
                        }
                    }

                    break;
                case BendType.BendRelease:
                    {
                        var middleGlyphs = new BendNoteHeadGroupGlyph();
                        middleGlyphs.Renderer = Renderer;
                        var middleBendPoint = _note.BendPoints[1];
                        middleGlyphs.AddGlyph(GetBendNoteValue(_note.BendPoints[1]), (middleBendPoint.Value % 2) != 0);
                        middleGlyphs.DoLayout();

                        _bendNoteHeads.Add(middleGlyphs);

                        var endGlyphs = new BendNoteHeadGroupGlyph();
                        endGlyphs.Renderer = Renderer;
                        var lastBendPoint = _note.BendPoints[_note.BendPoints.Count - 1];
                        endGlyphs.AddGlyph(GetBendNoteValue(lastBendPoint), (lastBendPoint.Value % 2) != 0);
                        endGlyphs.DoLayout();

                        _bendNoteHeads.Add(endGlyphs);
                    }

                    break;
            }
            base.DoLayout();
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
            if (direction == BeamDirection.Down)
            {
                startY += NoteHeadGlyph.NoteHeadHeight * Scale;
            }

            if (_note.IsTieOrigin)
            {
                var endNote = _note.TieDestination;
                var endNoteRenderer = endNote == null ? null : Renderer.ScoreRenderer.Layout.GetRendererForBar(Renderer.Staff.StaveId, endNote.Beat.Voice.Bar);

                // if we have a line break we draw only a line until the end
                if (endNoteRenderer == null || endNoteRenderer.Staff != startNoteRenderer.Staff)
                {
                    var endX = cx + startNoteRenderer.X + startNoteRenderer.Width;
                    var noteValueToDraw = _note.TieDestination.RealValue;

                    var accidental = startNoteRenderer.AccidentalHelper.ApplyAccidentalForValue(noteValueToDraw, false);
                    var endY = cy + startNoteRenderer.Y + startNoteRenderer.GetScoreY(startNoteRenderer.AccidentalHelper.GetNoteLineForValue(noteValueToDraw));

                    DrawBendSlur(canvas, startX, startY, endX, endY, direction == BeamDirection.Down, Scale);
                }
                // otherwise we draw a line to the target note
                else
                {
                    var endX = cx + endNoteRenderer.X + endNoteRenderer.GetBeatX(endNote.Beat, BeatXPosition.MiddleNotes);
                    var endY = cy + endNoteRenderer.Y + endNoteRenderer.GetNoteY(endNote, true);
                    if (direction == BeamDirection.Down)
                    {
                        endY += NoteHeadGlyph.NoteHeadHeight * Scale;
                    }
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

                var heightOffset = (NoteHeadGlyph.NoteHeadHeight * Scale * NoteHeadGlyph.GraceScale) * 0.5f;
                if (direction == BeamDirection.Up) heightOffset = -heightOffset;
                int endValue;
                float endY;

                switch (_note.BendType)
                {
                    case BendType.Bend:
                        _bendNoteHeads[0].X = endX - _bendNoteHeads[0].NoteHeadOffset;
                        _bendNoteHeads[0].Y = cy + startNoteRenderer.Y;
                        _bendNoteHeads[0].Paint(0, 0, canvas);

                        endValue = GetBendNoteValue(_note.BendPoints[_note.BendPoints.Count - 1]);
                        endY = _bendNoteHeads[0].GetNoteValueY(endValue) + heightOffset;
                        DrawBendSlur(canvas, startX, startY, endX, endY, direction == BeamDirection.Down, Scale);

                        break;
                    case BendType.BendRelease:
                        var middleX = (startX + endX) / 2;

                        _bendNoteHeads[0].X = middleX - _bendNoteHeads[0].NoteHeadOffset;
                        _bendNoteHeads[0].Y = cy + startNoteRenderer.Y;
                        _bendNoteHeads[0].Paint(0, 0, canvas);
                        var middleValue = GetBendNoteValue(_note.BendPoints[1]);
                        var middleY = _bendNoteHeads[0].GetNoteValueY(middleValue) + heightOffset;
                        DrawBendSlur(canvas, startX, startY, middleX, middleY, direction == BeamDirection.Down, Scale);

                        _bendNoteHeads[1].X = endX - _bendNoteHeads[1].NoteHeadOffset;
                        _bendNoteHeads[1].Y = cy + startNoteRenderer.Y;
                        _bendNoteHeads[1].Paint(0, 0, canvas);
                        endValue = GetBendNoteValue(_note.BendPoints[_note.BendPoints.Count - 1]);
                        endY = _bendNoteHeads[1].GetNoteValueY(endValue) + heightOffset;
                        DrawBendSlur(canvas, middleX, middleY, endX, endY, direction == BeamDirection.Down, Scale);

                        break;
                    case BendType.Release:
                        if (_bendNoteHeads.Count > 0)
                        {
                            _bendNoteHeads[0].X = endX - _bendNoteHeads[0].NoteHeadOffset;
                            _bendNoteHeads[0].Y = cy + startNoteRenderer.Y;
                            _bendNoteHeads[0].Paint(0, 0, canvas);
                            endValue = GetBendNoteValue(_note.BendPoints[_note.BendPoints.Count - 1]);
                            endY = _bendNoteHeads[0].GetNoteValueY(endValue) + heightOffset;
                            DrawBendSlur(canvas, startX, startY, endX, endY, direction == BeamDirection.Down, Scale);
                        }
                        break;
                    case BendType.Prebend:
                    case BendType.PrebendBend:
                    case BendType.PrebendRelease:

                        var preX = cx + startNoteRenderer.X + startNoteRenderer.GetBeatX(_note.Beat, BeatXPosition.PreNotes);
                        preX += ((ScoreBeatPreNotesGlyph)startNoteRenderer.GetBeatContainer(_note.Beat).PreNotes).PrebendNoteHeadOffset;

                        var preY = cy + startNoteRenderer.Y + startNoteRenderer.GetScoreY(startNoteRenderer.AccidentalHelper.GetNoteLineForValue(_note.RealValue)) + heightOffset;

                        DrawBendSlur(canvas, preX, preY, startX, startY, direction == BeamDirection.Down, Scale);

                        if (_bendNoteHeads.Count > 0)
                        {
                            _bendNoteHeads[0].X = endX - _bendNoteHeads[0].NoteHeadOffset;
                            _bendNoteHeads[0].Y = cy + startNoteRenderer.Y;
                            _bendNoteHeads[0].Paint(0, 0, canvas);

                            endValue = GetBendNoteValue(_note.BendPoints[_note.BendPoints.Count - 1]);
                            endY = _bendNoteHeads[0].GetNoteValueY(endValue) + heightOffset;
                            DrawBendSlur(canvas, startX, startY, endX, endY, direction == BeamDirection.Down, Scale);
                        }

                        break;
                }
            }
        }

        private int GetBendNoteValue(BendPoint bendPoint)
        {
            // NOTE: bendpoints are in 1/4 tones, but the note values are in 1/2 notes. 
            return _note.RealValue + bendPoint.Value / 2;
        }
    }
}