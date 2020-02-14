using System;
using AlphaTab.Model;
using AlphaTab.Platform;

namespace AlphaTab.Rendering.Glyphs
{
    internal class ScoreSlideLineGlyph : Glyph
    {
        private readonly SlideOutType _outType;
        private readonly SlideInType _inType;
        private readonly Note _startNote;
        private readonly BeatContainerGlyph _parent;

        public ScoreSlideLineGlyph(SlideInType inType, SlideOutType outType, Note startNote, BeatContainerGlyph parent)
            : base(0, 0)
        {
            _outType = outType;
            _inType = inType;
            _startNote = startNote;
            _parent = parent;
        }

        public override void DoLayout()
        {
            Width = 0;
        }

        public override void Paint(float cx, float cy, ICanvas canvas)
        {
            PaintSlideIn(cx, cy, canvas);
            DrawSlideOut(cx, cy, canvas);
        }

        private void PaintSlideIn(float cx, float cy, ICanvas canvas)
        {
            var startNoteRenderer = (ScoreBarRenderer)Renderer;
            var sizeX = 12 * Scale;
            var offsetX = 1 * Scale;
            float startX;
            float startY;
            float endX;
            float endY;

            switch (_inType)
            {
                case SlideInType.IntoFromBelow:
                    endX = cx + startNoteRenderer.X + startNoteRenderer.GetNoteX(_startNote, false) - offsetX;
                    endY = cy + startNoteRenderer.Y + startNoteRenderer.GetNoteY(_startNote, true) +
                           NoteHeadGlyph.NoteHeadHeight / 2;

                    startX = endX - sizeX;
                    startY = cy + startNoteRenderer.Y + startNoteRenderer.GetNoteY(_startNote, true) +
                             NoteHeadGlyph.NoteHeadHeight;

                    break;
                case SlideInType.IntoFromAbove:
                    endX = cx + startNoteRenderer.X + startNoteRenderer.GetNoteX(_startNote, false) - offsetX;
                    endY = cy + startNoteRenderer.Y + startNoteRenderer.GetNoteY(_startNote, true) +
                           NoteHeadGlyph.NoteHeadHeight / 2;

                    startX = endX - sizeX;
                    startY = cy + startNoteRenderer.Y + startNoteRenderer.GetNoteY(_startNote, true);
                    break;
                default:
                    return;
            }

            var accidentalsWidth = GetAccidentalsWidth(startNoteRenderer, _startNote.Beat);
            startX -= accidentalsWidth;
            endX -= accidentalsWidth;

            PaintSlideLine(canvas, false, startX, endX, startY, endY);
        }


        private float GetAccidentalsWidth(ScoreBarRenderer renderer, Beat beat)
        {
            var preNotes = (ScoreBeatPreNotesGlyph)renderer.GetPreNotesGlyphForBeat(beat);
            if (preNotes != null && preNotes.Accidentals != null)
            {
                return preNotes.Accidentals.Width;
            }

            return 0;
        }

        private void DrawSlideOut(float cx, float cy, ICanvas canvas)
        {
            var startNoteRenderer = (ScoreBarRenderer)Renderer;
            var sizeX = 12 * Scale;
            var offsetX = 1 * Scale;
            float startX;
            float startY;
            float endX;
            float endY;
            var waves = false;

            switch (_outType)
            {
                case SlideOutType.Shift:
                case SlideOutType.Legato:
                    startX = cx + startNoteRenderer.X +
                             startNoteRenderer.GetBeatX(_startNote.Beat, BeatXPosition.PostNotes) + offsetX;
                    var isUp = _startNote.SlideTarget.RealValue > _startNote.RealValue;
                    startY = cy + startNoteRenderer.Y + startNoteRenderer.GetNoteY(_startNote);
                    var lineOffset = 0.25f * NoteHeadGlyph.NoteHeadHeight * Scale;
                    if (isUp)
                    {
                        startY += lineOffset;
                    }
                    else
                    {
                        startY -= lineOffset;
                    }

                    if (_startNote.SlideTarget != null)
                    {
                        var endNoteRenderer =
                            Renderer.ScoreRenderer.Layout.GetRendererForBar<BarRendererBase>(Renderer.Staff.StaveId,
                                _startNote.SlideTarget.Beat.Voice.Bar);
                        if (endNoteRenderer == null || endNoteRenderer.Staff != startNoteRenderer.Staff)
                        {
                            endX = cx + startNoteRenderer.X + _parent.X;
                            endY = startY;
                        }
                        else
                        {
                            endX = cx + endNoteRenderer.X +
                                   endNoteRenderer.GetBeatX(_startNote.SlideTarget.Beat, BeatXPosition.PreNotes) -
                                   offsetX;
                            endY = cy + endNoteRenderer.Y + endNoteRenderer.GetNoteY(_startNote.SlideTarget);
                            if (isUp)
                            {
                                endY -= lineOffset;
                            }
                            else
                            {
                                endY += lineOffset;
                            }
                        }
                    }
                    else
                    {
                        endX = cx + startNoteRenderer.X + _parent.X;
                        endY = startY;
                    }

                    break;
                case SlideOutType.OutUp:
                    startX = cx + startNoteRenderer.X + startNoteRenderer.GetNoteX(_startNote) + offsetX * 2;
                    startY = cy + startNoteRenderer.Y + startNoteRenderer.GetNoteY(_startNote, true) +
                             NoteHeadGlyph.NoteHeadHeight / 2;
                    endX = startX + sizeX;
                    endY = cy + startNoteRenderer.Y + startNoteRenderer.GetNoteY(_startNote, true);
                    break;
                case SlideOutType.OutDown:
                    startX = cx + startNoteRenderer.X + startNoteRenderer.GetNoteX(_startNote) + offsetX * 2;
                    startY = cy + startNoteRenderer.Y + startNoteRenderer.GetNoteY(_startNote, true) +
                             NoteHeadGlyph.NoteHeadHeight / 2;
                    endX = startX + sizeX;
                    endY = cy + startNoteRenderer.Y + startNoteRenderer.GetNoteY(_startNote, true) +
                           NoteHeadGlyph.NoteHeadHeight;
                    break;
                case SlideOutType.PickSlideUp:
                    startX = cx + startNoteRenderer.X + startNoteRenderer.GetNoteX(_startNote) + offsetX * 2;
                    startY = cy + startNoteRenderer.Y + startNoteRenderer.GetNoteY(_startNote, true) +
                             NoteHeadGlyph.NoteHeadHeight / 2;
                    endY = cy + startNoteRenderer.Y + startNoteRenderer.GetNoteY(_startNote, true) -
                           NoteHeadGlyph.NoteHeadHeight;
                    endX = cx + startNoteRenderer.X + startNoteRenderer.Width;

                    if (_startNote.Beat.NextBeat != null && _startNote.Beat.NextBeat.Voice == _startNote.Beat.Voice)
                    {
                        endX = cx + startNoteRenderer.X +
                               startNoteRenderer.GetBeatX(_startNote.Beat.NextBeat, BeatXPosition.PreNotes);
                    }

                    waves = true;
                    break;
                case SlideOutType.PickSlideDown:
                    startX = cx + startNoteRenderer.X + startNoteRenderer.GetNoteX(_startNote) + offsetX * 2;
                    startY = cy + startNoteRenderer.Y + startNoteRenderer.GetNoteY(_startNote, true) -
                             NoteHeadGlyph.NoteHeadHeight / 2;
                    endY = cy + startNoteRenderer.Y + startNoteRenderer.GetNoteY(_startNote, true) +
                           NoteHeadGlyph.NoteHeadHeight;
                    endX = cx + startNoteRenderer.X + startNoteRenderer.Width;

                    if (_startNote.Beat.NextBeat != null && _startNote.Beat.NextBeat.Voice == _startNote.Beat.Voice)
                    {
                        endX = cx + startNoteRenderer.X +
                               startNoteRenderer.GetBeatX(_startNote.Beat.NextBeat, BeatXPosition.PreNotes);
                    }

                    waves = true;
                    break;
                default:
                    return;
            }

            PaintSlideLine(canvas, waves, startX, endX, startY, endY);
        }

        private void PaintSlideLine(ICanvas canvas, bool waves, float startX, float endX, float startY, float endY)
        {
            if (waves)
            {
                var b = endX - startX;
                var a = endY - startY;
                var c = Math.Sqrt(Math.Pow(a, 2) + Math.Pow(b, 2));
                var angle = (float)(Math.Asin(a / c) * (180 / Math.PI));
                canvas.BeginRotate(startX, startY, angle);

                var glyph = new NoteVibratoGlyph(0, 0, VibratoType.Slight);
                glyph.Renderer = Renderer;
                glyph.DoLayout();
                glyph.Width = b;
                glyph.Paint(0, 0, canvas);

                canvas.EndRotate();
            }
            else
            {
                canvas.BeginPath();
                canvas.MoveTo(startX, startY);
                canvas.LineTo(endX, endY);
                canvas.Stroke();
            }
        }
    }
}
