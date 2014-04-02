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
            if (EndNote == null || StartNote.Beat.Index != EndNote.Beat.Index) return;
            ScoreBarRenderer r = (ScoreBarRenderer)Renderer;
            BeatContainerGlyph parent = (BeatContainerGlyph)Parent;
            var startX = cx + r.GetNoteX(StartNote);
            var endX = EndNote == null
                        ? cx + parent.X + parent.PostNotes.X + parent.PostNotes.Width  // end of beat container
                        : cx + r.GetNoteX(EndNote, false);

            var startY = cy + r.GetNoteY(StartNote) + (NoteHeadGlyph.NoteHeadHeight / 2);
            var endY = EndNote == null ? startY : cy + r.GetNoteY(EndNote) + (NoteHeadGlyph.NoteHeadHeight / 2);

            PaintTie(canvas, Scale, startX, startY, endX, endY, r.GetBeatDirection(StartNote.Beat) == BeamDirection.Down);

            canvas.Color = Renderer.Layout.Renderer.RenderingResources.MainGlyphColor;
            canvas.Fill();
        }
    }
}
