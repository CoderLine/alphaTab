using System;
using AlphaTab.Collections;
using AlphaTab.Model;
using AlphaTab.Platform;

namespace AlphaTab.Rendering.Glyphs
{
    internal class TabBendRenderPoint : BendPoint
    {
        public int LineValue { get; set; }

        public TabBendRenderPoint(int offset = 0, int value = 0) : base(offset, value)
        {
            LineValue = value;
        }
    }

    internal class TabBendGlyph : Glyph
    {
        private FastList<Note> _notes;

        private const int ArrowSize = 6;
        private const int DashSize = 3;
        private const int BendValueHeight = 6;
        private FastDictionary<int, FastList<TabBendRenderPoint>> _renderPoints;

        // the values where to draw the arrow heads as multistring bends end at the same position

        private int _preBendMinValue; // directly above the note
        private int _bendMiddleMinValue; // in the middle between note and end
        private int _bendEndMinValue; // at the end on the helper note
        private int _bendEndContinuedMinValue; // at the end on the next note
        private int _releaseMinValue; // at the end for releases on the helper note
        private int _releaseContinuedMinValue; // at the end for releases on the next note

        private int _maxBendValue;


        public TabBendGlyph()
            : base(0, 0)
        {
            _notes = new FastList<Note>();
            _renderPoints = new FastDictionary<int, FastList<TabBendRenderPoint>>();
            _preBendMinValue = -1;
            _bendMiddleMinValue = -1;
            _bendEndMinValue = -1;
            _bendEndContinuedMinValue = -1;
            _releaseMinValue = -1;
            _releaseContinuedMinValue = -1;
            _maxBendValue = -1;
        }

        public void AddBends(Note note)
        {
            _notes.Add(note);
            var renderPoints = CreateRenderingPoints(note);
            _renderPoints[note.Id] = renderPoints;

            if (_maxBendValue == -1 || _maxBendValue < note.MaxBendPoint.Value)
            {
                _maxBendValue = note.MaxBendPoint.Value;
            }

            // compute arrow end values for common bend types
            int value;
            switch (note.BendType)
            {
                case BendType.Bend:
                    value = renderPoints[1].Value;
                    if (note.IsTieOrigin)
                    {
                        if (_bendEndContinuedMinValue == -1 || value < _bendEndContinuedMinValue)
                        {
                            _bendEndContinuedMinValue = value;
                        }
                    }
                    else
                    {
                        if (_bendEndMinValue == -1 || value < _bendEndMinValue)
                        {
                            _bendEndMinValue = value;
                        }
                    }

                    break;
                case BendType.Release:
                    value = renderPoints[1].Value;
                    if (note.IsTieOrigin)
                    {
                        if (_releaseContinuedMinValue == -1 || value < _releaseContinuedMinValue)
                        {
                            _releaseContinuedMinValue = value;
                        }
                    }
                    else
                    {
                        if (value > 0 && (_releaseMinValue == -1 || value < _releaseMinValue))
                        {
                            _releaseMinValue = value;
                        }
                    }

                    break;
                case BendType.BendRelease:
                    value = renderPoints[1].Value;
                    if (_bendMiddleMinValue == -1 || value < _bendMiddleMinValue)
                    {
                        _bendMiddleMinValue = value;
                    }

                    value = renderPoints[2].Value;
                    if (note.IsTieOrigin)
                    {
                        if (_releaseContinuedMinValue == -1 || value < _releaseContinuedMinValue)
                        {
                            _releaseContinuedMinValue = value;
                        }
                    }
                    else
                    {
                        if (value > 0 && (_releaseMinValue == -1 || value < _releaseMinValue))
                        {
                            _releaseMinValue = value;
                        }
                    }

                    break;
                case BendType.Prebend:
                    value = renderPoints[0].Value;
                    if (_preBendMinValue == -1 || value < _preBendMinValue)
                    {
                        _preBendMinValue = value;
                    }

                    break;
                case BendType.PrebendBend:
                    value = renderPoints[0].Value;
                    if (_preBendMinValue == -1 || value < _preBendMinValue)
                    {
                        _preBendMinValue = value;
                    }

                    value = renderPoints[1].Value;
                    if (note.IsTieOrigin)
                    {
                        if (_bendEndContinuedMinValue == -1 || value < _bendEndContinuedMinValue)
                        {
                            _bendEndContinuedMinValue = value;
                        }
                    }
                    else
                    {
                        if (_bendEndMinValue == -1 || value < _bendEndMinValue)
                        {
                            _bendEndMinValue = value;
                        }
                    }

                    break;
                case BendType.PrebendRelease:
                    value = renderPoints[0].Value;
                    if (_preBendMinValue == -1 || value < _preBendMinValue)
                    {
                        _preBendMinValue = value;
                    }

                    value = renderPoints[1].Value;
                    if (note.IsTieOrigin)
                    {
                        if (_releaseContinuedMinValue == -1 || value < _releaseContinuedMinValue)
                        {
                            _releaseContinuedMinValue = value;
                        }
                    }
                    else
                    {
                        if (value > 0 && (_releaseMinValue == -1 || value < _releaseMinValue))
                        {
                            _releaseMinValue = value;
                        }
                    }

                    break;
            }
        }

        public override void DoLayout()
        {
            base.DoLayout();

            var bendHeight = _maxBendValue * BendValueHeight * Scale;
            Renderer.RegisterOverflowTop(bendHeight);

            int value;
            foreach (var note in _notes)
            {
                var renderPoints = _renderPoints[note.Id];
                switch (note.BendType)
                {
                    case BendType.Bend:
                        renderPoints[1].LineValue = note.IsTieOrigin ? _bendEndContinuedMinValue : _bendEndMinValue;
                        break;
                    case BendType.Release:
                        value = note.IsTieOrigin ? _releaseContinuedMinValue : _releaseMinValue;
                        if (value >= 0)
                        {
                            renderPoints[1].LineValue = value;
                        }

                        break;
                    case BendType.BendRelease:
                        renderPoints[1].LineValue = _bendMiddleMinValue;
                        value = note.IsTieOrigin ? _releaseContinuedMinValue : _releaseMinValue;
                        if (value >= 0)
                        {
                            renderPoints[2].LineValue = value;
                        }

                        break;
                    case BendType.Prebend:
                        renderPoints[0].LineValue = _preBendMinValue;
                        break;
                    case BendType.PrebendBend:
                        renderPoints[0].LineValue = _preBendMinValue;
                        renderPoints[1].LineValue = note.IsTieOrigin ? _bendEndContinuedMinValue : _bendEndMinValue;
                        break;
                    case BendType.PrebendRelease:
                        renderPoints[0].LineValue = _preBendMinValue;
                        value = note.IsTieOrigin ? _releaseContinuedMinValue : _releaseMinValue;
                        if (value >= 0)
                        {
                            renderPoints[1].LineValue = value;
                        }

                        break;
                }
            }

            Width = 0;

            _notes.Sort((a, b) =>
            {
                if (a.IsStringed)
                {
                    return a.String - b.String;
                }

                return a.RealValue - b.RealValue;
            });
        }

        private FastList<TabBendRenderPoint> CreateRenderingPoints(Note note)
        {
            var renderingPoints = new FastList<TabBendRenderPoint>();

            // Guitar Pro Rendering Note:
            // Last point of bend is always at end of the note even
            // though it might not be 100% correct from timing perspective.

            switch (note.BendType)
            {
                case BendType.Custom:
                    foreach (var bendPoint in note.BendPoints)
                    {
                        renderingPoints.Add(new TabBendRenderPoint(bendPoint.Offset, bendPoint.Value));
                    }

                    break;
                case BendType.BendRelease:
                    renderingPoints.Add(new TabBendRenderPoint(0, note.BendPoints[0].Value));
                    renderingPoints.Add(new TabBendRenderPoint(BendPoint.MaxPosition / 2, note.BendPoints[1].Value));
                    renderingPoints.Add(new TabBendRenderPoint(BendPoint.MaxPosition, note.BendPoints[3].Value));
                    break;
                case BendType.Bend:
                case BendType.Hold:
                case BendType.Prebend:
                case BendType.PrebendBend:
                case BendType.PrebendRelease:
                case BendType.Release:
                    renderingPoints.Add(new TabBendRenderPoint(0, note.BendPoints[0].Value));
                    renderingPoints.Add(new TabBendRenderPoint(BendPoint.MaxPosition, note.BendPoints[1].Value));
                    break;
            }

            return renderingPoints;
        }

        public override void Paint(float cx, float cy, ICanvas canvas)
        {
            var color = canvas.Color;
            if (_notes.Count > 1)
            {
                canvas.Color = Renderer.Resources.SecondaryGlyphColor;
            }

            foreach (var note in _notes)
            {
                var renderPoints = _renderPoints[note.Id];
                var startNoteRenderer = Renderer;
                var endNote = note;
                var isMultiBeatBend = false;
                TabBarRenderer endNoteRenderer;
                var endNoteHasBend = false;
                var slurText = note.BendStyle == BendStyle.Gradual ? "grad." : "";

                Beat endBeat = null;
                while (endNote.IsTieOrigin)
                {
                    var nextNote = endNote.TieDestination;

                    endNoteRenderer =
                        Renderer.ScoreRenderer.Layout.GetRendererForBar<TabBarRenderer>(Renderer.Staff.StaveId,
                            nextNote.Beat.Voice.Bar);

                    if (endNoteRenderer == null || startNoteRenderer.Staff != endNoteRenderer.Staff)
                    {
                        break;
                    }

                    endNote = nextNote;
                    isMultiBeatBend = true;

                    if (endNote.HasBend || !Renderer.Settings.Notation.ExtendBendArrowsOnTiedNotes)
                    {
                        endNoteHasBend = true;
                        break;
                    }
                }

                endBeat = endNote.Beat;
                endNoteRenderer =
                    Renderer.ScoreRenderer.Layout.GetRendererForBar<TabBarRenderer>(Renderer.Staff.StaveId,
                        endBeat.Voice.Bar);

                if (endBeat.IsLastOfVoice && !endNote.HasBend && Renderer.Settings.Notation.ExtendBendArrowsOnTiedNotes)
                {
                    endBeat = null;
                }

                float startX = 0;
                float endX = 0;

                var topY = cy + startNoteRenderer.Y;
                // float bottomY = cy + startNoteRenderer.Y + startNoteRenderer.GetNoteY(note);

                startX = cx + startNoteRenderer.X;
                if (renderPoints[0].Value > 0 || note.IsContinuedBend)
                {
                    startX += startNoteRenderer.GetBeatX(note.Beat, BeatXPosition.MiddleNotes);
                }
                else
                {
                    startX += startNoteRenderer.GetNoteX(note);
                }

                //canvas.Color = Color.Random();
                //canvas.FillRect(
                //    cx + startNoteRenderer.X + startNoteRenderer.GetBeatX(_note.Beat, BeatXPosition.MiddleNotes),
                //    cy + startNoteRenderer.Y, 10, 10);
                //canvas.FillRect(
                //    cx + startNoteRenderer.X + startNoteRenderer.GetBeatX(_note.Beat, BeatXPosition.EndBeat),
                //    cy + startNoteRenderer.Y + 10, 10, 10);

                if (endBeat == null || endBeat.IsLastOfVoice && !endNoteHasBend)
                {
                    endX = cx + endNoteRenderer.X + endNoteRenderer.PostBeatGlyphsStart;
                }
                else if (endNoteHasBend || endBeat.NextBeat == null)
                {
                    endX = cx + endNoteRenderer.X + endNoteRenderer.GetBeatX(endBeat, BeatXPosition.MiddleNotes);
                }
                else if (note.BendType == BendType.Hold)
                {
                    endX = cx + endNoteRenderer.X + endNoteRenderer.GetBeatX(endBeat.NextBeat, BeatXPosition.OnNotes);
                }
                else
                {
                    endX = cx + endNoteRenderer.X + endNoteRenderer.GetBeatX(endBeat.NextBeat, BeatXPosition.PreNotes);
                }

                if (!isMultiBeatBend)
                {
                    endX -= ArrowSize * Scale;
                }

                // we need some pixels for the arrow. otherwise we might draw into the next
                // note
                var width = endX - startX;

                // calculate offsets per step

                var dX = width / BendPoint.MaxPosition;

                canvas.BeginPath();
                for (int i = 0, j = renderPoints.Count - 1; i < j; i++)
                {
                    var firstPt = renderPoints[i];
                    var secondPt = renderPoints[i + 1];

                    // draw pre-bend if previous
                    if (i == 0 && firstPt.Value != 0 && !note.IsTieDestination)
                    {
                        PaintBend(note, new TabBendRenderPoint(), firstPt, startX, topY, dX, slurText, canvas);
                    }

                    if (note.BendType != BendType.Prebend)
                    {
                        PaintBend(note, firstPt, secondPt, startX, topY, dX, slurText, canvas);
                    }
                    else if (note.IsTieOrigin && note.TieDestination.HasBend)
                    {
                        PaintBend(note,
                            firstPt,
                            new TabBendRenderPoint(BendPoint.MaxPosition, firstPt.Value)
                            {
                                LineValue = firstPt.LineValue
                            },
                            startX,
                            topY,
                            dX,
                            slurText,
                            canvas);
                    }
                }

                canvas.Color = color;
            }
        }

        private void PaintBend(
            Note note,
            TabBendRenderPoint firstPt,
            TabBendRenderPoint secondPt,
            float cx,
            float cy,
            float dX,
            string slurText,
            ICanvas canvas)
        {
            var r = (TabBarRenderer)Renderer;
            var res = Renderer.Resources;

            var overflowOffset = r.LineOffset / 2;

            var x1 = cx + dX * firstPt.Offset;
            var bendValueHeight = BendValueHeight * Scale;
            var y1 = cy - bendValueHeight * firstPt.LineValue;
            if (firstPt.Value == 0)
            {
                if (secondPt.Offset == firstPt.Offset)
                {
                    y1 += r.GetNoteY(note.Beat.MaxStringNote, true);
                }
                else
                {
                    y1 += r.GetNoteY(note);
                }
            }
            else
            {
                y1 += overflowOffset;
            }

            var x2 = cx + dX * secondPt.Offset;
            var y2 = cy - bendValueHeight * secondPt.LineValue;
            if (secondPt.LineValue == 0)
            {
                y2 += r.GetNoteY(note);
            }
            else
            {
                y2 += overflowOffset;
            }

            // what type of arrow? (up/down)
            var arrowOffset = 0f;
            var arrowSize = ArrowSize * Scale;
            if (secondPt.Value > firstPt.Value)
            {
                if (y2 + arrowSize > y1)
                {
                    y2 = y1 - arrowSize;
                }

                canvas.BeginPath();
                canvas.MoveTo(x2, y2);
                canvas.LineTo(x2 - arrowSize * 0.5f, y2 + arrowSize);
                canvas.LineTo(x2 + arrowSize * 0.5f, y2 + arrowSize);
                canvas.ClosePath();
                canvas.Fill();
                arrowOffset = arrowSize;
            }
            else if (secondPt.Value != firstPt.Value)
            {
                if (y2 < y1)
                {
                    y2 = y1 + arrowSize;
                }

                canvas.BeginPath();
                canvas.MoveTo(x2, y2);
                canvas.LineTo(x2 - arrowSize * 0.5f, y2 - arrowSize);
                canvas.LineTo(x2 + arrowSize * 0.5f, y2 - arrowSize);
                canvas.ClosePath();
                canvas.Fill();
                arrowOffset = -arrowSize;
            }

            canvas.Stroke();

            if (firstPt.Value == secondPt.Value)
            {
                // draw horizontal dashed line
                // to really have the line ending at the right position
                // we draw from right to left. it's okay if the space is at the beginning
                if (firstPt.LineValue > 0)
                {
                    var dashX = x2;
                    var dashSize = DashSize * Scale;
                    var end = x1 + dashSize;
                    var dashes = (dashX - x1) / (dashSize * 2);
                    if (dashes < 1)
                    {
                        canvas.MoveTo(dashX, y1);
                        canvas.LineTo(x1, y1);
                    }
                    else
                    {
                        while (dashX > end)
                        {
                            canvas.MoveTo(dashX, y1);
                            canvas.LineTo(dashX - dashSize, y1);
                            dashX -= dashSize * 2;
                        }
                    }

                    canvas.Stroke();
                }
            }
            else
            {
                if (x2 > x1)
                {
                    // draw bezier lien from first to second point
                    canvas.MoveTo(x1, y1);
                    canvas.BezierCurveTo((x1 + x2) / 2, y1, x2, y1, x2, y2 + arrowOffset);
                    canvas.Stroke();
                }
                else
                {
                    canvas.MoveTo(x1, y1);
                    canvas.LineTo(x2, y2);
                    canvas.Stroke();
                }
            }

            if (!string.IsNullOrEmpty(slurText) && firstPt.Offset < secondPt.Offset)
            {
                canvas.Font = res.GraceFont;
                var size = canvas.MeasureText(slurText);
                float y;
                float x;
                if (y1 > y2)
                {
                    var h = Math.Abs(y1 - y2);
                    y = h > canvas.Font.Size * 1.3f ? y1 - h / 2 : y1;
                    x = (x1 + x2 - size) / 2;
                }
                else
                {
                    y = y1;
                    x = x2 - size;
                }

                canvas.FillText(slurText, x, y);
            }

            if (secondPt.Value != 0 && firstPt.Value != secondPt.Value)
            {
                var dV = secondPt.Value;
                var up = secondPt.Value > firstPt.Value;
                dV = Math.Abs(dV);

                // calculate label
                var s = "";
                // Full Steps
                if (dV == 4)
                {
                    s = "full";
                    dV -= 4;
                }
                else if (dV >= 4 || dV <= -4)
                {
                    var steps = dV / 4;
                    s += steps;
                    // Quaters
                    dV -= steps * 4;
                }

                if (dV > 0)
                {
                    s += GetFractionSign(dV);
                }

                if (s != "")
                {
                    y2 = cy - bendValueHeight * secondPt.Value;
                    var startY = y2;
                    if (!up)
                    {
                        startY = y1 + Math.Abs(y2 - y1) * 1f / 3;
                    }

                    // draw label
                    canvas.Font = res.TablatureFont;
                    var size = canvas.MeasureText(s);
                    var y = startY - res.TablatureFont.Size * 0.5f - 2 * Scale;
                    var x = x2 - size / 2;

                    canvas.FillText(s, x, y);
                }
            }
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
