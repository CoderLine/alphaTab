using AlphaTab.Model;
using AlphaTab.Platform;

namespace AlphaTab.Rendering.Glyphs
{
    public class ScoreSlideLineGlyph : Glyph
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

        public override bool CanScale
        {
            get { return false; }
        }

        public override void Paint(int cx, int cy, ICanvas canvas)
        {
            ScoreBarRenderer r = (ScoreBarRenderer)Renderer;
            var sizeX = (int)(12 * Scale);
            var offsetX = (int)(1 * Scale);
            int startX;
            int startY;
            int endX;
            int endY;
            switch (_type)
            {
                case SlideType.Shift:
                case SlideType.Legato:
                    startX = cx + r.GetNoteX(_startNote) + offsetX;
                    startY = cy + r.GetNoteY(_startNote) + NoteHeadGlyph.NoteHeadHeight / 2;

                    if (_startNote.SlideTarget != null)
                    {
                        endX = cx + r.GetNoteX(_startNote.SlideTarget, false) - offsetX;
                        endY = cy + r.GetNoteY(_startNote.SlideTarget) + NoteHeadGlyph.NoteHeadHeight / 2;
                    }
                    else
                    {
                        endX = cx + _parent.X + _parent.PostNotes.X + _parent.PostNotes.Width;
                        endY = startY;
                    }
                    break;
                case SlideType.IntoFromBelow:
                    endX = cx + r.GetNoteX(_startNote, false) - offsetX;
                    endY = cy + r.GetNoteY(_startNote) + NoteHeadGlyph.NoteHeadHeight / 2;

                    startX = endX - sizeX;
                    startY = cy + r.GetNoteY(_startNote) + NoteHeadGlyph.NoteHeadHeight;
                    break;
                case SlideType.IntoFromAbove:
                    endX = cx + r.GetNoteX(_startNote, false) - offsetX;
                    endY = cy + r.GetNoteY(_startNote) + NoteHeadGlyph.NoteHeadHeight / 2;

                    startX = endX - sizeX;
                    startY = cy + r.GetNoteY(_startNote);
                    break;
                case SlideType.OutUp:
                    startX = cx + r.GetNoteX(_startNote) + offsetX;
                    startY = cy + r.GetNoteY(_startNote) + NoteHeadGlyph.NoteHeadHeight / 2;
                    endX = startX + sizeX;
                    endY = cy + r.GetNoteY(_startNote);
                    break;
                case SlideType.OutDown:
                    startX = cx + r.GetNoteX(_startNote) + offsetX;
                    startY = cy + r.GetNoteY(_startNote) + NoteHeadGlyph.NoteHeadHeight / 2;
                    endX = startX + sizeX;
                    endY = cy + r.GetNoteY(_startNote) + NoteHeadGlyph.NoteHeadHeight;
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
