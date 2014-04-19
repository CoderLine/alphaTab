using AlphaTab.Model;
using AlphaTab.Platform;

namespace AlphaTab.Rendering.Glyphs
{
    public class TabTieGlyph : TieGlyph
    {
        public TabTieGlyph(Note startNote, Note endNote, Glyph parent)
            : base(startNote, endNote, parent)
        {
        }

        public override void Paint(int cx, int cy, ICanvas canvas)
        {
            if (EndNote == null) return;

            TabBarRenderer glyphRenderer = (TabBarRenderer)Renderer;

            TabBarRenderer startNoteRenderer =
                (TabBarRenderer)glyphRenderer.Stave.GetRendererForBar(StartNote.Beat.Voice.Bar.Index);
            TabBarRenderer endNoteRenderer =
                (TabBarRenderer)glyphRenderer.Stave.GetRendererForBar(EndNote.Beat.Voice.Bar.Index);


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

            TabBeatContainerGlyph parent = (TabBeatContainerGlyph)Parent;
            var res = glyphRenderer.Resources;
            var startX = cx + startNoteRenderer.GetNoteX(StartNote, false);
            var endX = endNote == null
                        ? cx + parent.X + parent.PostNotes.X + parent.PostNotes.Width  // end of beat container
                        : cx + endNoteRenderer.GetNoteX(endNote, false);

            var down = StartNote.String > 3;
            var offset = (res.TablatureFont.Size / 2);
            if (down)
            {
                offset *= -1;
            }

            var startY = cy + startNoteRenderer.GetNoteY(StartNote) + offset;
            var endY = endNote == null ? startY : cy + endNoteRenderer.GetNoteY(endNote) + offset;

            PaintTie(canvas, Scale, startX, startY, endX, endY, StartNote.String > 3);

            canvas.Fill();
        }

    }
}
