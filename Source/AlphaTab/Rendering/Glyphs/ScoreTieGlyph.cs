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

            ScoreBarRenderer r = (ScoreBarRenderer)Renderer;

            bool isOnSameLine = r.Stave.StaveGroup.MasterBars.Contains(EndNote.Beat.Voice.Bar.MasterBar);
            Note endNote = isOnSameLine ? EndNote : null;

            BeatContainerGlyph parent = (BeatContainerGlyph)Parent;
            var startX = cx + r.GetNoteX(StartNote);
            var endX = endNote == null
                        ? cx + parent.X + parent.PostNotes.X + parent.PostNotes.Width  // end of beat container
                        : cx + r.GetNoteX(endNote, false);

            var startY = cy + r.GetNoteY(StartNote) + (NoteHeadGlyph.NoteHeadHeight / 2);
            var endY = endNote == null ? startY : cy + r.GetNoteY(endNote) + (NoteHeadGlyph.NoteHeadHeight / 2);

            PaintTie(canvas, Scale, startX, startY, endX, endY, r.GetBeatDirection(StartNote.Beat) == BeamDirection.Down);

            canvas.Color = Renderer.Layout.Renderer.RenderingResources.MainGlyphColor;
            canvas.Fill();
        }
    }
}
