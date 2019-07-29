using AlphaTab.Model;
using AlphaTab.Rendering.Utils;

namespace AlphaTab.Rendering.Glyphs
{
    class TabTieGlyph : TieGlyph
    {
        protected Note StartNote;
        protected Note EndNote;
        protected readonly bool ForSlide;

        public TabTieGlyph(Note startNote, Note endNote, bool forSlide, bool forEnd = false)
            : base(startNote.Beat, endNote.Beat, forEnd)
        {
            StartNote = startNote;
            EndNote = endNote;
            ForSlide = forSlide;
        }

        private float Offset
        {
            get { return ForSlide ? 5 * Scale : 0; }
        }

        protected override BeamDirection GetBeamDirection(Beat beat, BarRendererBase noteRenderer)
        {
            return GetBeamDirection(StartNote);
        }

        protected static BeamDirection GetBeamDirection(Note note)
        {
            return note.String > 3
                ? BeamDirection.Up
                : BeamDirection.Down;
        }

        protected override float GetStartY(BarRendererBase noteRenderer, BeamDirection direction)
        {
            return noteRenderer.GetNoteY(StartNote) - Offset;
        }

        protected override float GetEndY(BarRendererBase noteRenderer, BeamDirection direction)
        {
            return noteRenderer.GetNoteY(EndNote) - Offset;
        }

        protected override float GetStartX(BarRendererBase noteRenderer)
        {
            return noteRenderer.GetNoteX(StartNote);
        }

        protected override float GetEndX(BarRendererBase noteRenderer)
        {
            return noteRenderer.GetNoteX(EndNote, false);
        }
    }
}