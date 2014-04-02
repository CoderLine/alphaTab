namespace AlphaTab.Rendering.Glyphs
{
    public class DigitGlyph : SvgGlyph
    {
        private readonly int _digit;

        public DigitGlyph(int x, int y, int digit)
            : base(x, y, GetDigit(digit), 1, 1)
        {
            _digit = digit;
        }

        public override void DoLayout()
        {
            Y += (int)(7 * Scale);
            Width = (int)(GetDigitWidth(_digit) * Scale);
        }

        private int GetDigitWidth(int digit)
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

        public override bool CanScale
        {
            get { return false; }
        }

        private static LazySvg GetDigit(int digit)
        {
            switch (digit)
            {
                case 0:
                    return MusicFont.Num0;
                case 1:
                    return MusicFont.Num1;
                case 2:
                    return MusicFont.Num2;
                case 3:
                    return MusicFont.Num3;
                case 4:
                    return MusicFont.Num4;
                case 5:
                    return MusicFont.Num5;
                case 6:
                    return MusicFont.Num6;
                case 7:
                    return MusicFont.Num7;
                case 8:
                    return MusicFont.Num8;
                case 9:
                    return MusicFont.Num9;
                default:
                    return null;
            }
        }



    }
}
