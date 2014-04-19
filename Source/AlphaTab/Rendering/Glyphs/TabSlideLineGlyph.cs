using AlphaTab.Model;
using AlphaTab.Platform;

namespace AlphaTab.Rendering.Glyphs
{
    public class TabSlideLineGlyph : Glyph
    {
        private readonly Note _startNote;
        private readonly SlideType _type;
        private readonly BeatContainerGlyph _parent;

        public TabSlideLineGlyph(SlideType type, Note startNote, BeatContainerGlyph parent)
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

        public override bool CanScale
        {
            get { return false; }
        }

        public override void Paint(int cx, int cy, ICanvas canvas)
        {
            TabBarRenderer r = (TabBarRenderer)Renderer;

            var sizeX = (int)(12 * Scale);
            var sizeY = (int)(3 * Scale);
            int startX;
            int startY;
            int endX;
            int endY;
            switch (_type)
            {
                case SlideType.Shift:
                case SlideType.Legato:
                    int startOffsetY;
                    int endOffsetY;

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

                    startX = cx + r.GetNoteX(_startNote);
                    startY = cy + r.GetNoteY(_startNote) + startOffsetY;
                    if (_startNote.SlideTarget != null)
                    {
                        endX = cx + r.GetNoteX(_startNote.SlideTarget, false);
                        endY = cy + r.GetNoteY(_startNote.SlideTarget) + endOffsetY;
                    }
                    else
                    {
                        endX = cx + _parent.X + _parent.PostNotes.X + _parent.PostNotes.Width;
                        endY = startY;
                    }
                    break;

                case SlideType.IntoFromBelow:
                    endX = cx + r.GetNoteX(_startNote, false);
                    endY = cy + r.GetNoteY(_startNote);

                    startX = endX - sizeX;
                    startY = cy + r.GetNoteY(_startNote) + sizeY;
                    break;
                case SlideType.IntoFromAbove:
                    endX = cx + r.GetNoteX(_startNote, false);
                    endY = cy + r.GetNoteY(_startNote);

                    startX = endX - sizeX;
                    startY = cy + r.GetNoteY(_startNote) - sizeY;
                    break;
                case SlideType.OutUp:
                    startX = cx + r.GetNoteX(_startNote);
                    startY = cy + r.GetNoteY(_startNote);

                    endX = startX + sizeX;
                    endY = cy + r.GetNoteY(_startNote) - sizeY;
                    break;

                case SlideType.OutDown:
                    startX = cx + r.GetNoteX(_startNote);
                    startY = cy + r.GetNoteY(_startNote);

                    endX = startX + sizeX;
                    endY = cy + r.GetNoteY(_startNote) + sizeY;
                    break;
                default:
                    return;
            }

            canvas.BeginPath();
            canvas.MoveTo(startX, startY);
            canvas.LineTo(endX, endY);
            canvas.Stroke();
        }
    }
}
