using System.Globalization;

namespace AlphaTab.Core
{
    public static class Globals
    {
        public const double NaN = double.NaN;
        public static Console Console { get; } = new Console();

        public static double ParseInt(string s)
        {
            if (double.TryParse(s, NumberStyles.Number, CultureInfo.InvariantCulture, out var d))
            {
                return (int) d;
            }

            return double.NaN;
        }

        public static double ParseInt(string s, int radix)
        {
            if (radix == 16 && int.TryParse(s, NumberStyles.HexNumber,
                CultureInfo.InvariantCulture,
                out var d))
            {
                return d;
            }

            return double.NaN;
        }

        public static double ParseFloat(string s)
        {
            if (double.TryParse(s, NumberStyles.Number, CultureInfo.InvariantCulture, out var d))
            {
                return d;
            }

            return double.NaN;
        }

        public static bool IsNaN(double d)
        {
            return double.IsNaN(d);
        }
    }
}
