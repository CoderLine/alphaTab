using System;
using AlphaTab.Model;

namespace AlphaTab.Rendering.Glyphs
{
    internal class ScoreSlurGlyph : ScoreTieGlyph
    {
        public ScoreSlurGlyph(Note startNote, Note endNote, bool forEnd = false)
            : base(startNote, endNote, forEnd)
        {
        }

        protected override float GetTieHeight(float startX, float startY, float endX, float endY)
        {
            return (float)Math.Log(endX - startX + 1) * Renderer.Settings.Notation.SlurHeight;
        }
    }
}
