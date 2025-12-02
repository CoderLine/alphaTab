using System.Globalization;

namespace AlphaTab.Core.EcmaScript;

internal static class Number
{
    public const double POSITIVE_INFINITY = double.PositiveInfinity;
    public const double MIN_SAFE_INTEGER = -9007199254740991.0;
    public const double MAX_SAFE_INTEGER = 9007199254740991.0;
    public const double NaN = double.NaN;

    public static double ParseInt(char c)
    {
        return ParseInt(c.ToString());
    }

    public static double ParseInt(string s)
    {
        if (double.TryParse(s, NumberStyles.Number, CultureInfo.InvariantCulture, out var d))
        {
            return (int)d;
        }

        return double.NaN;
    }

    public static double ParseInt(char c, int radix)
    {
        return ParseInt(c.ToString(), radix);
    }

    public static double ParseInt(string s, int radix)
    {
        if (radix == 16 && int.TryParse(s, NumberStyles.HexNumber,
                CultureInfo.InvariantCulture,
                out var d))
        {
            return d;
        }

        if (radix == 10 && int.TryParse(s, NumberStyles.Integer, CultureInfo.InvariantCulture,
                out d))
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
