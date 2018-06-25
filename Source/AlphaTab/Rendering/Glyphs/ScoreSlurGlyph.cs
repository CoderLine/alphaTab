using AlphaTab.Collections;
using AlphaTab.Model;
using AlphaTab.Platform;
using AlphaTab.Rendering.Utils;

namespace AlphaTab.Rendering.Glyphs
{
    class ScoreSlurGlyph : Glyph
    {
        private readonly Beat _startBeat;

        public ScoreSlurGlyph(Beat startBeat)
        : base(0, 0)
        {
            _startBeat = startBeat;
        }

        protected BeamDirection GetBeamDirection(Beat beat, BarRendererBase noteRenderer)
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

        public override void Paint(float cx, float cy, ICanvas canvas)
        {
            // only render slur once per staff
            var slurId = "score.slur." + _startBeat.SlurOrigin.Id;
            var renderer = Renderer;
            var isSlurRendered = renderer.Staff.GetSharedLayoutData(slurId, false);
            if (!isSlurRendered)
            {
                renderer.Staff.SetSharedLayoutData(slurId, true);

                var startNoteRenderer = Renderer.ScoreRenderer.Layout.GetRendererForBar<BarRendererBase>(Renderer.Staff.StaveId, _startBeat.Voice.Bar);
                var direction = GetBeamDirection(_startBeat, startNoteRenderer);

                var startX = cx + startNoteRenderer.X;
                var startY = cy + startNoteRenderer.Y;
                if (_startBeat.SlurOrigin.Id == _startBeat.Id)
                {
                    startX += startNoteRenderer.GetBeatX(_startBeat, BeatXPosition.MiddleNotes);
                    var note = direction == BeamDirection.Down ? _startBeat.MinNote : _startBeat.MaxNote;
                    startY += startNoteRenderer.GetNoteY(note);
                }
                else
                {
                    startY += startNoteRenderer.Height;
                }
                var endBeat = _startBeat.SlurOrigin.SlurDestination;

                var endNoteRenderer = Renderer.ScoreRenderer.Layout.GetRendererForBar<BarRendererBase>(Renderer.Staff.StaveId, endBeat.Voice.Bar);
                float endX;
                float endY;
                if (endNoteRenderer == null || startNoteRenderer.Staff != endNoteRenderer.Staff)
                {
                    endNoteRenderer = startNoteRenderer.Staff.BarRenderers[startNoteRenderer.Staff.BarRenderers.Count - 1];
                    endX = cx + endNoteRenderer.X + endNoteRenderer.Width;
                    endY = cy + endNoteRenderer.Y + endNoteRenderer.Height;
                }
                else
                {
                    endX = cx + endNoteRenderer.X + endNoteRenderer.GetBeatX(endBeat, BeatXPosition.MiddleNotes);
                    var note = direction == BeamDirection.Down ? endBeat.MinNote : endBeat.MaxNote;
                    endY = cy + endNoteRenderer.Y + endNoteRenderer.GetNoteY(note);
                }

                TieGlyph.PaintTie(canvas, Scale, startX, startY, endX, endY, direction == BeamDirection.Down);
                canvas.Fill();
            }
        }
    }

    class TabSlurGlyph : Glyph
    {
        private readonly Note _startNote;

        public TabSlurGlyph(Note startNote)
        : base(0, 0)
        {
            _startNote = startNote;
        }

        private BeamDirection GetBeamDirection(Note note)
        {
            return note.String > 3
                ? BeamDirection.Up
                : BeamDirection.Down;
        }

        public override void Paint(float cx, float cy, ICanvas canvas)
        {
            // only render slur once per staff
            var slurId = "tab.slur." + _startNote.SlurOrigin.Beat.Id + "." + _startNote.SlurOrigin.SlurDestination.Beat.Id;
            var renderer = Renderer;
            var isSlurRendered = renderer.Staff.GetSharedLayoutData(slurId, false);
            if (!isSlurRendered)
            {
                renderer.Staff.SetSharedLayoutData(slurId, true);

                var startNoteRenderer = Renderer.ScoreRenderer.Layout.GetRendererForBar<BarRendererBase>(Renderer.Staff.StaveId, _startNote.Beat.Voice.Bar);
                var direction = GetBeamDirection(_startNote);

                var startX = cx + startNoteRenderer.X;
                var startY = cy + startNoteRenderer.Y +
                             startNoteRenderer.GetNoteY(_startNote, direction == BeamDirection.Up);
                if (_startNote.SlurOrigin.Id == _startNote.Id)
                {
                    startX += startNoteRenderer.GetBeatX(_startNote.Beat, BeatXPosition.MiddleNotes);
                }

                var endNote = _startNote.SlurOrigin.SlurDestination;
                var endNoteRenderer = Renderer.ScoreRenderer.Layout.GetRendererForBar<BarRendererBase>(Renderer.Staff.StaveId, endNote.Beat.Voice.Bar);
                float endX;
                float endY = startY;
                if (endNoteRenderer == null || startNoteRenderer.Staff != endNoteRenderer.Staff)
                {
                    endNoteRenderer = startNoteRenderer.Staff.BarRenderers[startNoteRenderer.Staff.BarRenderers.Count - 1];
                    endX = cx + endNoteRenderer.X + endNoteRenderer.Width;
                }
                else
                {
                    endX = cx + endNoteRenderer.X + endNoteRenderer.GetBeatX(endNote.Beat, BeatXPosition.MiddleNotes);
                }

                TieGlyph.PaintTie(canvas, Scale, startX, startY, endX, endY, direction == BeamDirection.Down);
                canvas.Fill();
            }

        }
    }
}
