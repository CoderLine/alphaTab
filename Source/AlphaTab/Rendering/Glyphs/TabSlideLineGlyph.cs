using System;
using AlphaTab.Model;
using AlphaTab.Platform;

namespace AlphaTab.Rendering.Glyphs
{
    internal class TabSlideLineGlyph : Glyph
    {
        private readonly SlideInType _inType;
        private readonly SlideOutType _outType;
        private readonly Note _startNote;
        private readonly BeatContainerGlyph _parent;

        public TabSlideLineGlyph(SlideInType inType, SlideOutType outType, Note startNote, BeatContainerGlyph parent)
            : base(0, 0)
        {
            _inType = inType;
            _outType = outType;
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
            PaintSlideOut(cx, cy, canvas);
        }

        private void PaintSlideIn(float cx, float cy, ICanvas canvas)
        {
            var startNoteRenderer = (TabBarRenderer)Renderer;

            var sizeX = 12 * Scale;
            var sizeY = 3 * Scale;
            float startX;
            float startY;
            float endX;
            float endY;

            switch (_inType)
            {
                case SlideInType.IntoFromBelow:
                    endX = cx + startNoteRenderer.X + startNoteRenderer.GetNoteX(_startNote, false);
                    endY = cy + startNoteRenderer.Y + startNoteRenderer.GetNoteY(_startNote);

                    startX = endX - sizeX;
                    startY = cy + startNoteRenderer.Y + startNoteRenderer.GetNoteY(_startNote) + sizeY;
                    break;
                case SlideInType.IntoFromAbove:
                    endX = cx + startNoteRenderer.X + startNoteRenderer.GetNoteX(_startNote, false);
                    endY = cy + startNoteRenderer.Y + startNoteRenderer.GetNoteY(_startNote);

                    startX = endX - sizeX;
                    startY = cy + startNoteRenderer.Y + startNoteRenderer.GetNoteY(_startNote) - sizeY;
                    break;
                default:
                    return;
            }

            PaintSlideLine(canvas, false, startX, endX, startY, endY);
        }


        private void PaintSlideOut(float cx, float cy, ICanvas canvas)
        {
            var startNoteRenderer = (TabBarRenderer)Renderer;

            var sizeX = 12 * Scale;
            var sizeY = 3 * Scale;
            float startX;
            float startY;
            float endX;
            float endY;
            var waves = false;

            switch (_outType)
            {
                case SlideOutType.Shift:
                case SlideOutType.Legato:
                    float startOffsetY;
                    float endOffsetY;

                    if (_startNote.SlideTarget == null)
                    {
                        startOffsetY = 0;
                        endOffsetY = 0;
                    }
                    else if (_startNote.SlideTarget.Fret > _startNote.Fret)
                    {
                        startOffsetY = sizeY;
                        endOffsetY = sizeY * -1;
                    }
                    else
                    {
                        startOffsetY = sizeY * -1;
                        endOffsetY = sizeY;
                    }

                    startX = cx + startNoteRenderer.X +
                             startNoteRenderer.GetBeatX(_startNote.Beat, BeatXPosition.PostNotes);
                    startY = cy + startNoteRenderer.Y + startNoteRenderer.GetNoteY(_startNote) + startOffsetY;
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
                                   endNoteRenderer.GetBeatX(_startNote.SlideTarget.Beat, BeatXPosition.OnNotes);
                            endY = cy + endNoteRenderer.Y + endNoteRenderer.GetNoteY(_startNote.SlideTarget) +
                                   endOffsetY;
                        }
                    }
                    else
                    {
                        endX = cx + startNoteRenderer.X + _parent.X;
                        endY = startY;
                    }

                    break;

                case SlideOutType.OutUp:
                    startX = cx + startNoteRenderer.X + startNoteRenderer.GetNoteX(_startNote);
                    startY = cy + startNoteRenderer.Y + startNoteRenderer.GetNoteY(_startNote);

                    endX = startX + sizeX;
                    endY = cy + startNoteRenderer.Y + startNoteRenderer.GetNoteY(_startNote) - sizeY;
                    break;

                case SlideOutType.OutDown:
                    startX = cx + startNoteRenderer.X + startNoteRenderer.GetNoteX(_startNote);
                    startY = cy + startNoteRenderer.Y + startNoteRenderer.GetNoteY(_startNote);

                    endX = startX + sizeX;
                    endY = cy + startNoteRenderer.Y + startNoteRenderer.GetNoteY(_startNote) + sizeY;
                    break;

                case SlideOutType.PickSlideDown:

                    startX = cx + startNoteRenderer.X + startNoteRenderer.GetNoteX(_startNote);
                    startY = cy + startNoteRenderer.Y + startNoteRenderer.GetNoteY(_startNote) - sizeY * 2;

                    endX = cx + startNoteRenderer.X +
                           startNoteRenderer.GetBeatX(_startNote.Beat, BeatXPosition.EndBeat);
                    endY = startY + sizeY * 3;

                    waves = true;
                    break;

                case SlideOutType.PickSlideUp:

                    startX = cx + startNoteRenderer.X + startNoteRenderer.GetNoteX(_startNote);
                    startY = cy + startNoteRenderer.Y + startNoteRenderer.GetNoteY(_startNote) + sizeY;

                    endX = cx + startNoteRenderer.X +
                           startNoteRenderer.GetBeatX(_startNote.Beat, BeatXPosition.EndBeat);
                    endY = startY - sizeY * 3;

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
