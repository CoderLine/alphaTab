using AlphaTab.Model;

namespace AlphaTab.Rendering.Glyphs
{
    class ScoreSlurGlyph : ScoreTieGlyph
    {
        public ScoreSlurGlyph(Note startNote, Note endNote, bool forEnd = false)
        : base(startNote, endNote, forEnd)
        {
        }

        protected override float GetTieHeight(float startX, float startY, float endX, float endY)
        {
            return (endX - startX) * Renderer.Settings.SlurHeightFactor;
        }
    }
}
