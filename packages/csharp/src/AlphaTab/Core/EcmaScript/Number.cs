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
    /// Parses like ECMAScript <c>parseInt</c>: leading whitespace and an optional sign are skipped,
    /// the longest prefix of digits of the radix is parsed, and NaN is returned if there is none.
    /// A radix of 0 means 10, or 16 for a <c>0x</c> prefix.
    /// </summary>
    public static double ParseInt(string s, int radix)
    {
        var i = 0;
        while (i < s.Length && IsWhiteSpace(s[i]))
        {
            i++;
        }

        var sign = 1.0;
        if (i < s.Length && (s[i] == '+' || s[i] == '-'))
        {
            if (s[i] == '-')
            {
                sign = -1.0;
            }

            i++;
        }

        var stripPrefix = true;
        if (radix != 0)
        {
            if (radix < 2 || radix > 36)
            {
                return double.NaN;
            }

            stripPrefix = radix == 16;
        }
        else
        {
            radix = 10;
        }

        if (stripPrefix && i + 1 < s.Length && s[i] == '0' && (s[i + 1] == 'x' || s[i + 1] == 'X'))
        {
            i += 2;
            radix = 16;
        }

        var start = i;
        var value = 0.0;
        while (i < s.Length)
        {
            var digit = DigitValue(s[i]);
            if (digit >= radix)
            {
                break;
            }

            value = value * radix + digit;
            i++;
        }

        if (i == start)
        {
            return double.NaN;
        }

        // beyond 2^53 only the decimal conversion rounds like ECMAScript
        if (radix == 10 && i - start > 15)
        {
            value = double.Parse(s.Substring(start, i - start), CultureInfo.InvariantCulture);
        }

        return sign * value;
    }

    private static bool IsWhiteSpace(char c)
    {
        return c is '\t' or '\n' or '\v' or '\f' or '\r' or '\u2028' or '\u2029' or '\uFEFF' ||
               char.GetUnicodeCategory(c) == UnicodeCategory.SpaceSeparator;
    }

    private static int DigitValue(char c)
    {
        return c switch
        {
            >= '0' and <= '9' => c - '0',
            >= 'a' and <= 'z' => c - 'a' + 10,
            >= 'A' and <= 'Z' => c - 'A' + 10,
            _ => int.MaxValue
        };
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
