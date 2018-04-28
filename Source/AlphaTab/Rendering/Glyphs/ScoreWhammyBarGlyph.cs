using AlphaTab.Model;
using AlphaTab.Platform;
using AlphaTab.Rendering.Utils;

namespace AlphaTab.Rendering.Glyphs
{
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