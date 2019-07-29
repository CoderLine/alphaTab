namespace AlphaTab.Rendering.Glyphs
{
    internal class TabTimeSignatureGlyph : TimeSignatureGlyph
    {
        protected override float CommonY
        {
            get
            {
                var renderer = (TabBarRenderer)Renderer;
                return renderer.GetTabY(0);
            }
        }

        protected override float NumeratorY
        {
            get
            {
                var renderer = (TabBarRenderer)Renderer;
                var offset = renderer.Bar.Staff.Tuning.Length <= 4 ? 1 / 4f : 1 / 3f;
                return renderer.LineOffset * renderer.Bar.Staff.Tuning.Length * offset * Scale;
            }
        }

        protected override float DenominatorY
        {
            get
            {
                var renderer = (TabBarRenderer)Renderer;
                const float offset = 3 / 5f;
                return renderer.LineOffset * renderer.Bar.Staff.Tuning.Length * offset * Scale;
            }
        }

        protected override float CommonScale => 1;

        protected override float NumberScale
        {
            get
            {
                var renderer = (TabBarRenderer)Renderer;
                if (renderer.Bar.Staff.Tuning.Length <= 4)
                {
                    return 0.75f;
                }

                return 1;
            }
        }

        public TabTimeSignatureGlyph(float x, float y, int numerator, int denominator, bool isCommon)
            : base(x, y, numerator, denominator, isCommon)
        {
        }
    }
}
