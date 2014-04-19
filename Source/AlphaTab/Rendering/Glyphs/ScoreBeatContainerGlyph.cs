using AlphaTab.Model;
using AlphaTab.Rendering.Glyphs;

namespace AlphaTab.Rendering
{
    public class ScoreBeatContainerGlyph : BeatContainerGlyph
    {
        public ScoreBeatContainerGlyph(Beat beat) : base(beat)
        {
        }

        protected override void CreateTies(Note n)
        {
            // create a tie if any effect requires it
            if (n.IsTieDestination && n.TieOrigin != null)
            {
                var tie = new ScoreTieGlyph(n.TieOrigin, n, this);
                Ties.Add(tie);
            }
            else if (n.IsHammerPullOrigin)
            {
                var tie = new ScoreTieGlyph(n, n.HammerPullDestination, this);
                Ties.Add(tie);
            }
            else if (n.SlideType == SlideType.Legato)
            {
                var tie = new ScoreTieGlyph(n, n.SlideTarget, this);
                Ties.Add(tie);
            }

            // TODO: depending on the type we have other positioning
            // we should place glyphs in the preNotesGlyph or postNotesGlyph if needed
            if (n.SlideType != SlideType.None)
            {
                var l = new ScoreSlideLineGlyph(n.SlideType, n, this);
                Ties.Add(l);
            }
        }
    }
}
