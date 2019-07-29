using System;
using AlphaTab.Model;
using AlphaTab.Platform;

namespace AlphaTab.Rendering.Glyphs
{
    class ScoreSlideLineGlyph : Glyph
    {
        private readonly Note _startNote;
        private readonly SlideType _type;
        private readonly BeatContainerGlyph _parent;

        public ScoreSlideLineGlyph(SlideType type, Note startNote, BeatContainerGlyph parent)
            : base(0, 0)
        {
            _type = type;
            _startNote = startNote;
            _parent = parent;
        }

        public override void DoLayout()
        {
            Width = 0;
        }

        public override void Paint(float cx, float cy, ICanvas canvas)
        {
            var startNoteRenderer = (ScoreBarRenderer)Renderer;

            var sizeX = 12 * Scale;
            var offsetX = 1 * Scale;
            float startX;
            float startY;
            float endX;
            float endY;
            bool waves = false;

            switch (_type)
            {
                case SlideType.Shift:
                case SlideType.Legato:
                    startX = cx + startNoteRenderer.X + startNoteRenderer.GetBeatX(_startNote.Beat, BeatXPosition.PostNotes) + offsetX;
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
                        var endNoteRenderer = Renderer.ScoreRenderer.Layout.GetRendererForBar<BarRendererBase>(Renderer.Staff.StaveId, _startNote.SlideTarget.Beat.Voice.Bar);
                        if (endNoteRenderer == null || endNoteRenderer.Staff != startNoteRenderer.Staff)
                        {
                            endX = cx + startNoteRenderer.X + _parent.X;
                            endY = startY;
                        }
                        else
                        {
                            endX = cx + endNoteRenderer.X + endNoteRenderer.GetBeatX(_startNote.SlideTarget.Beat, BeatXPosition.PreNotes) - offsetX;
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
                case SlideType.IntoFromBelow:
                    endX = cx + startNoteRenderer.X + startNoteRenderer.GetNoteX(_startNote, false) - offsetX;
                    endY = cy + startNoteRenderer.Y + startNoteRenderer.GetNoteY(_startNote) + NoteHeadGlyph.NoteHeadHeight / 2;

                    startX = endX - sizeX;
                    startY = cy + startNoteRenderer.Y + startNoteRenderer.GetNoteY(_startNote) + NoteHeadGlyph.NoteHeadHeight;
                    break;
                case SlideType.IntoFromAbove:
                    endX = cx + startNoteRenderer.X + startNoteRenderer.GetNoteX(_startNote, false) - offsetX;
                    endY = cy + startNoteRenderer.Y + startNoteRenderer.GetNoteY(_startNote) + NoteHeadGlyph.NoteHeadHeight / 2;

                    startX = endX - sizeX;
                    startY = cy + startNoteRenderer.Y + startNoteRenderer.GetNoteY(_startNote);
                    break;
                case SlideType.OutUp:
                    startX = cx + startNoteRenderer.X + startNoteRenderer.GetNoteX(_startNote) + offsetX;
                    startY = cy + startNoteRenderer.Y + startNoteRenderer.GetNoteY(_startNote) + NoteHeadGlyph.NoteHeadHeight / 2;
                    endX = startX + sizeX;
                    endY = cy + startNoteRenderer.Y + startNoteRenderer.GetNoteY(_startNote);
                    break;
                case SlideType.OutDown:
                    startX = cx + startNoteRenderer.X + startNoteRenderer.GetNoteX(_startNote) + offsetX;
                    startY = cy + startNoteRenderer.Y + startNoteRenderer.GetNoteY(_startNote) + NoteHeadGlyph.NoteHeadHeight / 2;
                    endX = startX + sizeX;
                    endY = cy + startNoteRenderer.Y + startNoteRenderer.GetNoteY(_startNote) + NoteHeadGlyph.NoteHeadHeight;
                    break;
                case SlideType.PickSlideUp:
                    startX = cx + startNoteRenderer.X + startNoteRenderer.GetNoteX(_startNote);
                    startY = cy + startNoteRenderer.Y + startNoteRenderer.GetNoteY(_startNote) + NoteHeadGlyph.NoteHeadHeight / 2;
                    endX = cx + startNoteRenderer.X + startNoteRenderer.GetBeatX(_startNote.Beat, BeatXPosition.EndBeat);
                    endY = cy + startNoteRenderer.Y + startNoteRenderer.GetNoteY(_startNote) - NoteHeadGlyph.NoteHeadHeight;
                    waves = true;
                    break;
                case SlideType.PickSlideDown:
                    startX = cx + startNoteRenderer.X + startNoteRenderer.GetNoteX(_startNote);
                    startY = cy + startNoteRenderer.Y + startNoteRenderer.GetNoteY(_startNote) - NoteHeadGlyph.NoteHeadHeight / 2;
                    endX = cx + startNoteRenderer.X + startNoteRenderer.GetBeatX(_startNote.Beat, BeatXPosition.EndBeat);
                    endY = cy + startNoteRenderer.Y + startNoteRenderer.GetNoteY(_startNote) + NoteHeadGlyph.NoteHeadHeight;
                    waves = true;
                    break;
                default:
                    return;
            }

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
