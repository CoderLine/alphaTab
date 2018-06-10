namespace AlphaTab.Rendering.Glyphs
{
    class ScoreTimeSignatureGlyph : TimeSignatureGlyph
    {
        protected override float CommonY
        {
            get
            {
                var renderer = (ScoreBarRenderer)Renderer;
                return renderer.GetScoreY(4);
            }
        }

        protected override float NumeratorY
        {
            get
            {
                return 2 * Scale;
            }
        }

        protected override float DenominatorY
        {
            get
            {
                return 20 * Scale;
            }
        }

        protected override float CommonScale
        {
            get
            {
                return 1;
            }
        }

        protected override float NumberScale
        {
            get
            {
                return 1;
            }
        }

        public ScoreTimeSignatureGlyph(float x, float y, int numerator, int denominator, bool isCommon) 
            : base(x, y, numerator, denominator, isCommon)
        {
        }
    }
}