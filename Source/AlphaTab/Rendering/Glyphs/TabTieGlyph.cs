using AlphaTab.Model;
using AlphaTab.Rendering.Utils;

namespace AlphaTab.Rendering.Glyphs
{
    public class TabTieGlyph : TieGlyph
    {
        public TabTieGlyph(Note startNote, Note endNote, Glyph parent, bool forEnd = false)
            : base(startNote, endNote, parent, forEnd)
        {
        }

        protected override BeamDirection GetBeamDirection(Note note, BarRendererBase noteRenderer)
        {
            return StartNote.String > 3
                ? BeamDirection.Down
                : BeamDirection.Up;
        }
    }
}
