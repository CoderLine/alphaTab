using AlphaTab.Model;
using AlphaTab.Rendering.Utils;

namespace AlphaTab.Rendering.Glyphs
{
    public class ScoreTieGlyph : TieGlyph
    {
        public ScoreTieGlyph(Note startNote, Note endNote, Glyph parent, bool forEnd = false)
            : base(startNote, endNote, parent, forEnd)
        {
        }

        protected override BeamDirection GetBeamDirection(Note note, BarRendererBase noteRenderer)
        {
            return ((ScoreBarRenderer)noteRenderer).GetBeatDirection(note.Beat);
        }
    }
}
