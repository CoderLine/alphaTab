using System;
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
        return ParseInt(s, 0);
    }

    public static double ParseInt(char c, int radix)
    {
        return ParseInt(c.ToString(), radix);
    }

    /// <summary>
    /// Parses an integer in radix 10 (also for radix 0) or 16, culture-invariant, with optional surrounding
    /// whitespace. In radix 10 the text is read like <see cref="ParseFloat"/> and truncated towards zero
    /// (<c>"3.5"</c> gives 3, <c>"-0.5"</c> gives -0). Unlike ECMAScript, text with trailing characters is NaN.
    /// </summary>
    public static double ParseInt(string s, int radix)
    {
        switch (radix)
        {
            case 0:
            case 10:
                return System.Math.Truncate(ParseFloat(s));
            case 16:
                return ulong.TryParse(s, NumberStyles.HexNumber, CultureInfo.InvariantCulture, out var hex)
                    ? hex
                    : double.NaN;
            default:
                throw new NotSupportedException($"Radix {radix} is not supported");
        }
    }

    /// <summary>
    /// Parses a decimal number with optional sign, fraction and exponent, culture-invariant, with optional
    /// surrounding whitespace. Unlike ECMAScript, text with trailing characters is NaN.
    /// </summary>
    public static double ParseFloat(string s)
    {
        return double.TryParse(s, NumberStyles.Float, CultureInfo.InvariantCulture, out var d) ? d : double.NaN;
    }

    public static bool IsNaN(double d)
    {
        return double.IsNaN(d);
    }
}
