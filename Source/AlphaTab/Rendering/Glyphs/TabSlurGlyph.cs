using AlphaTab.Model;
using AlphaTab.Platform;
using AlphaTab.Rendering.Utils;

namespace AlphaTab.Rendering.Glyphs
{
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
            return note.String > 3 || note.Beat.Notes.Count > 1 && note.String == note.Beat.MaxStringNote.String
                 ? BeamDirection.Up
                 : BeamDirection.Down;
        }

        public override void Paint(float cx, float cy, ICanvas canvas)
        {
            // only render slur once per staff
            var slurId = "tab.slur." + _startNote.SlurOrigin.Beat.Id + "." + _startNote.SlurOrigin.SlurDestination.Beat.Id;
            var renderer = (TabBarRenderer)Renderer;
            var isSlurRendered = renderer.Staff.GetSharedLayoutData(slurId, false);
            if (!isSlurRendered)
            {
                renderer.Staff.SetSharedLayoutData(slurId, true);

                var startNoteRenderer = Renderer.ScoreRenderer.Layout.GetRendererForBar<BarRendererBase>(Renderer.Staff.StaveId, _startNote.Beat.Voice.Bar);
                var direction = GetBeamDirection(_startNote);

                var startX = cx + startNoteRenderer.X;
                var startY = cy + startNoteRenderer.Y +
                             startNoteRenderer.GetNoteY(_startNote, true);
                if (direction == BeamDirection.Down)
                {
                    startY += renderer.GetTabY(1);
                }


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