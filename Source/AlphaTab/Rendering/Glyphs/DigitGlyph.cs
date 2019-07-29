namespace AlphaTab.Rendering.Glyphs
{
    class DigitGlyph : MusicFontGlyph
    {
        private readonly int _digit;
        private readonly float _scale;

        public DigitGlyph(float x, float y, int digit, float scale)
            : base(x, y, scale, GetSymbol(digit))
        {
            _digit = digit;
            _scale = scale;
        }

        public override void DoLayout()
        {
            Y += 7 * Scale;
            Width = GetDigitWidth(_digit) * Scale * _scale;
        }

        private float GetDigitWidth(int digit)
        {
            switch (digit)
            {
                case 0:
                case 2:
                case 3:
                case 4:
                case 5:
                case 6:
                case 7:
                case 8:
                case 9:
                    return 14;
                case 1:
                    return 10;
                default:
                    return 0;
            }
        }

        private static MusicFontSymbol GetSymbol(int digit)
        {
            switch (digit)
            {
                case 0:
                    return MusicFontSymbol.Num0;
                case 1:
                    return MusicFontSymbol.Num1;
                case 2:
                    return MusicFontSymbol.Num2;
                case 3:
                    return MusicFontSymbol.Num3;
                case 4:
                    return MusicFontSymbol.Num4;
                case 5:
                    return MusicFontSymbol.Num5;
                case 6:
                    return MusicFontSymbol.Num6;
                case 7:
                    return MusicFontSymbol.Num7;
                case 8:
                    return MusicFontSymbol.Num8;
                case 9:
                    return MusicFontSymbol.Num9;
                default:
                    return MusicFontSymbol.None;
            }
        }
    }
}
