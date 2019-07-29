using AlphaTab.Model;
using AlphaTab.Rendering.Utils;

namespace AlphaTab.Rendering.Glyphs
{
    internal class ScoreTieGlyph : TieGlyph
    {
        protected readonly Note StartNote;
        protected readonly Note EndNote;

        public ScoreTieGlyph(Note startNote, Note endNote, bool forEnd = false)
            : base(startNote == null ? null : startNote.Beat, endNote == null ? null : endNote.Beat, forEnd)
        {
            StartNote = startNote;
            EndNote = endNote;
        }

        public override void DoLayout()
        {
            base.DoLayout();
            YOffset = NoteHeadGlyph.NoteHeadHeight / 2;
        }

        protected override BeamDirection GetBeamDirection(Beat beat, BarRendererBase noteRenderer)
        {
            // invert direction (if stems go up, ties go down to not cross them)
            switch (((ScoreBarRenderer)noteRenderer).GetBeatDirection(beat))
            {
                case BeamDirection.Up:
                    return BeamDirection.Down;
                case BeamDirection.Down:
                default:
                    return BeamDirection.Up;
            }
        }

        protected override float GetStartY(BarRendererBase noteRenderer, BeamDirection direction)
        {
            return noteRenderer.GetNoteY(StartNote);
        }

        protected override float GetEndY(BarRendererBase noteRenderer, BeamDirection direction)
        {
            return noteRenderer.GetNoteY(EndNote);
        }

        protected override float GetStartX(BarRendererBase noteRenderer)
        {
            return noteRenderer.GetBeatX(StartNote.Beat, BeatXPosition.MiddleNotes);
        }

        protected override float GetEndX(BarRendererBase noteRenderer)
        {
            return noteRenderer.GetNoteX(EndNote, false);
        }
    }
}
