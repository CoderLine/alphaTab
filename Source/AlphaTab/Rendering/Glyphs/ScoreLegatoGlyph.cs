using AlphaTab.Model;
using AlphaTab.Rendering.Utils;

namespace AlphaTab.Rendering.Glyphs
{
    class ScoreLegatoGlyph : TieGlyph
    {
        public ScoreLegatoGlyph(Beat startBeat, Beat endBeat, bool forEnd = false)
            : base(startBeat, endBeat, forEnd)
        {
        }

        public override void DoLayout()
        {
            base.DoLayout();
            YOffset = (NoteHeadGlyph.NoteHeadHeight/2);
        }

        protected override BeamDirection GetBeamDirection(Beat beat, BarRendererBase noteRenderer)
        {
            if (beat.IsRest)
            {
                return BeamDirection.Up;
            }

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
            if (StartBeat.IsRest)
            {
                // below all lines
                return ((ScoreBarRenderer)noteRenderer).GetScoreY(9);
            }

            switch (direction)
            {
                case BeamDirection.Up:
                    // below lowest note
                    return noteRenderer.GetNoteY(StartBeat.MinNote);
                default:
                    return noteRenderer.GetNoteY(StartBeat.MaxNote);
            }
        }

        protected override float GetEndY(BarRendererBase noteRenderer, BeamDirection direction)
        {
            if (EndBeat.IsRest)
            {
                switch (direction)
                {
                    case BeamDirection.Up:
                        return ((ScoreBarRenderer)noteRenderer).GetScoreY(9);
                    default:
                        return ((ScoreBarRenderer)noteRenderer).GetScoreY(0);
                }
            }

            switch (direction)
            {
                case BeamDirection.Up:
                    // below lowest note
                    return ((ScoreBarRenderer)noteRenderer).GetNoteY(EndBeat.MinNote);
                default:
                    return ((ScoreBarRenderer)noteRenderer).GetNoteY(EndBeat.MaxNote);
            }
        }

        protected override float GetStartX(BarRendererBase noteRenderer)
        {
            if (StartBeat.IsRest)
            {
                return noteRenderer.GetBeatX(StartBeat);
            }
            else
            {
                return noteRenderer.GetNoteX(StartBeat.MinNote);
            }
        }

        protected override float GetEndX(BarRendererBase noteRenderer)
        {
            if (EndBeat.IsRest)
            {
                return noteRenderer.GetBeatX(EndBeat);
            }
            else
            {
                return noteRenderer.GetNoteX(EndBeat.MinNote, false);
            }
        }

    }
}