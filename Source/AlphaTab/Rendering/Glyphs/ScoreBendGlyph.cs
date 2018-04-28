using System;
using AlphaTab.Collections;
using AlphaTab.Model;
using AlphaTab.Platform;
using AlphaTab.Rendering.Utils;

namespace AlphaTab.Rendering.Glyphs
{
    public class ScoreHelperNotesBaseGlyph : Glyph
    {
        private const int SlurHeight = 11;
        public const int EndPadding = (NoteHeadGlyph.QuarterNoteHeadWidth / 2) + 3;
        protected FastList<BendNoteHeadGroupGlyph> _bendNoteHeads;

        public ScoreHelperNotesBaseGlyph()
            : base(0, 0)
        {
            _bendNoteHeads = new FastList<BendNoteHeadGroupGlyph>();
        }

        protected void DrawBendSlur(ICanvas canvas, float x1, float y1, float x2, float y2, bool down, float scale)
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
            if (x2 - x1 < 20)
            {
                offset /= 2;
            }
            var cp1X = centerX + (offset * normalVectorX);
            var cp1Y = centerY + (offset * normalVectorY);

            canvas.BeginPath();

            canvas.MoveTo(x1, y1);
            canvas.LineTo(cp1X, cp1Y);
            canvas.LineTo(x2, y2);

            canvas.Stroke();
        }

        public override void DoLayout()
        {
            base.DoLayout();

            Width = 0;
            foreach (var noteHeads in _bendNoteHeads)
            {
                Width += noteHeads.Width + 15 * Scale;
            }
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

    }
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

    public class ScoreWhammyBarGlyph : ScoreHelperNotesBaseGlyph
    {
        private readonly Beat _beat;

        public ScoreWhammyBarGlyph(Beat beat)
        {
            _beat = beat;
        }

        public override void DoLayout()
        {

            switch (_beat.WhammyBarType)
            {
                case WhammyType.None:
                case WhammyType.Custom:
                case WhammyType.Hold:
                    return;
                case WhammyType.Dive:
                case WhammyType.PrediveDive:
                    {
                        var endGlyphs = new BendNoteHeadGroupGlyph();
                        endGlyphs.Renderer = Renderer;

                        var lastWhammyPoint = _beat.WhammyBarPoints[_beat.WhammyBarPoints.Count - 1];
                        foreach (var note in _beat.Notes)
                        {
                            endGlyphs.AddGlyph(GetBendNoteValue(note, lastWhammyPoint), (lastWhammyPoint.Value % 2) != 0);
                        }

                        endGlyphs.DoLayout();
                        _bendNoteHeads.Add(endGlyphs);
                    }
                    break;
                case WhammyType.Dip:
                    {
                        var middleGlyphs = new BendNoteHeadGroupGlyph();
                        middleGlyphs.Renderer = Renderer;
                        var middleBendPoint = _beat.WhammyBarPoints[1];
                        foreach (var note in _beat.Notes)
                        {
                            middleGlyphs.AddGlyph(GetBendNoteValue(note, _beat.WhammyBarPoints[1]), (middleBendPoint.Value % 2) != 0);
                        }

                        middleGlyphs.DoLayout();
                        _bendNoteHeads.Add(middleGlyphs);

                        var endGlyphs = new BendNoteHeadGroupGlyph();
                        endGlyphs.Renderer = Renderer;
                        var lastBendPoint = _beat.WhammyBarPoints[_beat.WhammyBarPoints.Count - 1];
                        foreach (var note in _beat.Notes)
                        {
                            endGlyphs.AddGlyph(GetBendNoteValue(note, lastBendPoint), (lastBendPoint.Value % 2) != 0);
                        }
                        endGlyphs.DoLayout();

                        _bendNoteHeads.Add(endGlyphs);
                    }
                    break;
                case WhammyType.Predive:
                    break;
            }
            base.DoLayout();
        }

        public override void Paint(float cx, float cy, ICanvas canvas)
        {
            var beat = _beat;
            switch (beat.WhammyBarType)
            {
                case WhammyType.None:
                case WhammyType.Custom:
                case WhammyType.Hold:
                    return;
            }

            var startNoteRenderer = (ScoreBarRenderer)Renderer.ScoreRenderer.Layout.GetRendererForBar(Renderer.Staff.StaveId, beat.Voice.Bar);
            var startX = cx + startNoteRenderer.X + startNoteRenderer.GetBeatX(beat, BeatXPosition.MiddleNotes);
            var direction = GetBeamDirection(beat, startNoteRenderer);

            foreach (var note in beat.Notes)
            {
                var startY = cy + startNoteRenderer.Y + startNoteRenderer.GetNoteY(note, true);
                if (direction == BeamDirection.Down)
                {
                    startY += NoteHeadGlyph.NoteHeadHeight * Scale;
                }

                var endX = cx + startNoteRenderer.X;
                if (beat.Index == beat.Voice.Beats.Count - 1)
                {
                    endX += startNoteRenderer.Width;
                }
                else
                {
                    endX += startNoteRenderer.GetBeatX(beat, BeatXPosition.EndBeat);
                }
                endX -= EndPadding * Scale;

                var heightOffset = (NoteHeadGlyph.NoteHeadHeight * Scale * NoteHeadGlyph.GraceScale) * 0.5f;
                if (direction == BeamDirection.Up) heightOffset = -heightOffset;
                int endValue;
                float endY;

                switch (beat.WhammyBarType)
                {
                    case WhammyType.Dive:
                        _bendNoteHeads[0].X = endX - _bendNoteHeads[0].NoteHeadOffset;
                        _bendNoteHeads[0].Y = cy + startNoteRenderer.Y;
                        _bendNoteHeads[0].Paint(0, 0, canvas);

                        endValue = GetBendNoteValue(note, beat.WhammyBarPoints[beat.WhammyBarPoints.Count - 1]);
                        endY = _bendNoteHeads[0].GetNoteValueY(endValue) + heightOffset;
                        DrawBendSlur(canvas, startX, startY, endX, endY, direction == BeamDirection.Down, Scale);

                        break;
                    case WhammyType.Dip:
                        var middleX = (startX + endX) / 2;

                        _bendNoteHeads[0].X = middleX - _bendNoteHeads[0].NoteHeadOffset;
                        _bendNoteHeads[0].Y = cy + startNoteRenderer.Y;
                        _bendNoteHeads[0].Paint(0, 0, canvas);
                        var middleValue = GetBendNoteValue(note, beat.WhammyBarPoints[1]);
                        var middleY = _bendNoteHeads[0].GetNoteValueY(middleValue) + heightOffset;
                        DrawBendSlur(canvas, startX, startY, middleX, middleY, direction == BeamDirection.Down, Scale);

                        _bendNoteHeads[1].X = endX - _bendNoteHeads[1].NoteHeadOffset;
                        _bendNoteHeads[1].Y = cy + startNoteRenderer.Y;
                        _bendNoteHeads[1].Paint(0, 0, canvas);
                        endValue = GetBendNoteValue(note, beat.WhammyBarPoints[beat.WhammyBarPoints.Count - 1]);
                        endY = _bendNoteHeads[1].GetNoteValueY(endValue) + heightOffset;
                        DrawBendSlur(canvas, middleX, middleY, endX, endY, direction == BeamDirection.Down, Scale);

                        break;
                    case WhammyType.PrediveDive:
                    case WhammyType.Predive:
                        var preX = cx + startNoteRenderer.X + startNoteRenderer.GetBeatX(note.Beat, BeatXPosition.PreNotes);
                        preX += ((ScoreBeatPreNotesGlyph)startNoteRenderer.GetBeatContainer(note.Beat).PreNotes).PrebendNoteHeadOffset;

                        var preY = cy + startNoteRenderer.Y + startNoteRenderer.GetScoreY(startNoteRenderer.AccidentalHelper.GetNoteLineForValue(note.RealValue)) + heightOffset;


                        if (_bendNoteHeads.Count > 0)
                        {
                            _bendNoteHeads[0].X = endX - _bendNoteHeads[0].NoteHeadOffset;
                            _bendNoteHeads[0].Y = cy + startNoteRenderer.Y;
                            _bendNoteHeads[0].Paint(0, 0, canvas);

                            endValue = GetBendNoteValue(note, beat.WhammyBarPoints[beat.WhammyBarPoints.Count - 1]);
                            endY = _bendNoteHeads[0].GetNoteValueY(endValue) + heightOffset;
                            DrawBendSlur(canvas, preX, preY, endX, endY, direction == BeamDirection.Down, Scale);
                        }
                        else
                        {
                            DrawBendSlur(canvas, preX, preY, startX, startY, direction == BeamDirection.Down, Scale);
                        }

                        break;
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