using AlphaTab.Model;
using AlphaTab.Platform;
using AlphaTab.Rendering.Utils;

namespace AlphaTab.Rendering.Glyphs
{
    public class ScoreTieGlyph : TieGlyph
    {
        public ScoreTieGlyph(Note startNote, Note endNote, Glyph parent)
            : base(startNote, endNote, parent)
        {
        }

        public override void Paint(int cx, int cy, ICanvas canvas)
        {
            if (EndNote == null) return;

            ScoreBarRenderer glyphRenderer = (ScoreBarRenderer)Renderer;

            ScoreBarRenderer startNoteRenderer =
                    (ScoreBarRenderer) glyphRenderer.Stave.GetRendererForBar(StartNote.Beat.Voice.Bar.Index);
            ScoreBarRenderer endNoteRenderer =
                    (ScoreBarRenderer) glyphRenderer.Stave.GetRendererForBar(EndNote.Beat.Voice.Bar.Index);

            // TODO: expand tie to next bar if possible
            Note endNote;
            if (startNoteRenderer != endNoteRenderer) 
            {
                endNote = null;
                endNoteRenderer = startNoteRenderer;
            }
            else
            {
                endNote = EndNote;
            }

            BeatContainerGlyph parent = (BeatContainerGlyph)Parent;
            var startX = cx + startNoteRenderer.GetNoteX(StartNote);
            var endX = endNote == null
                        ? cx + parent.X + parent.PostNotes.X + parent.PostNotes.Width  // end of beat container
                        : cx + endNoteRenderer.GetNoteX(endNote, false);

            var startY = cy + startNoteRenderer.GetNoteY(StartNote) + (NoteHeadGlyph.NoteHeadHeight / 2);
            var endY = endNote == null ? startY : cy + endNoteRenderer.GetNoteY(endNote) + (NoteHeadGlyph.NoteHeadHeight / 2);

            PaintTie(canvas, Scale, startX, startY, endX, endY, startNoteRenderer.GetBeatDirection(StartNote.Beat) == BeamDirection.Down);

            canvas.Fill();
        }
    }
}
