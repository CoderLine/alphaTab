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
            if (EndNote == null || StartNote.Beat.Index != EndNote.Beat.Index) return;
            TabBarRenderer r = (TabBarRenderer)Renderer;
            TabBeatContainerGlyph parent = (TabBeatContainerGlyph)Parent;
            var res = r.Resources;
            var startX = cx + r.GetNoteX(StartNote);
            var endX = EndNote == null
                        ? cx + parent.X + parent.PostNotes.X + parent.PostNotes.Width  // end of beat container
                        : cx + r.GetNoteX(EndNote, false);

            var down = StartNote.String > 3;
            var offset = (res.TablatureFont.Size / 2);
            if (down)
            {
                offset *= -1;
            }

            var startY = cy + r.GetNoteY(StartNote) + offset;
            var endY = EndNote == null ? startY : cy + r.GetNoteY(EndNote) + offset;

            PaintTie(canvas, Scale, startX, startY, endX, endY, StartNote.String > 3);

            canvas.Color = Renderer.Layout.Renderer.RenderingResources.MainGlyphColor;
            canvas.Fill();
        }

    }
}
