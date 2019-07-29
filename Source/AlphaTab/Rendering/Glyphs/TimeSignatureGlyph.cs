namespace AlphaTab.Rendering.Glyphs
{
    abstract class TimeSignatureGlyph : GlyphGroup
    {
        private readonly int _numerator;
        private readonly int _denominator;
        private readonly bool _isCommon;

        public TimeSignatureGlyph(float x, float y, int numerator, int denominator, bool isCommon)
            : base(x, y)
        {
            _numerator = numerator;
            _denominator = denominator;
            _isCommon = isCommon;
        }

        protected abstract float CommonY { get; }
        protected abstract float NumeratorY { get; }
        protected abstract float DenominatorY { get; }
        protected abstract float CommonScale { get; }
        protected abstract float NumberScale { get; }

        public override void DoLayout()
        {
            if (_isCommon && _numerator == 2 && _denominator == 2)
            {
                var common = new MusicFontGlyph(0, CommonY, CommonScale, MusicFontSymbol.TimeSignatureCutCommon);
                common.Width = 14 * Scale;
                AddGlyph(common);
                base.DoLayout();
            }
            else if (_isCommon && _numerator == 4 && _denominator == 4)
            {
                var common = new MusicFontGlyph(0, CommonY, CommonScale, MusicFontSymbol.TimeSignatureCommon);
                common.Width = 14 * Scale;
                AddGlyph(common);
                base.DoLayout();
            }
            else
            {
                var numerator = new NumberGlyph(0, NumeratorY, _numerator, NumberScale);
                var denominator = new NumberGlyph(0, DenominatorY, _denominator, NumberScale);

                AddGlyph(numerator);
                AddGlyph(denominator);

                base.DoLayout();

                for (int i = 0, j = Glyphs.Count; i < j; i++)
                {
                    var g = Glyphs[i];
                    g.X = (Width - g.Width) / 2;
                }
            }
        }
    }
}
