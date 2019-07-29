namespace AlphaTab.Rendering.Glyphs
{
    internal class ScoreTimeSignatureGlyph : TimeSignatureGlyph
    {
        protected override float CommonY
        {
            get
            {
                var renderer = (ScoreBarRenderer)Renderer;
                return renderer.GetScoreY(4);
            }
        }

        protected override float NumeratorY => 2 * Scale;

        protected override float DenominatorY => 20 * Scale;

        protected override float CommonScale => 1;

        protected override float NumberScale => 1;

        public ScoreTimeSignatureGlyph(float x, float y, int numerator, int denominator, bool isCommon)
            : base(x, y, numerator, denominator, isCommon)
        {
        }
    }
}
