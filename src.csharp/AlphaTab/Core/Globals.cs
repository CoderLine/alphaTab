using System;
using System.Diagnostics;
using System.Globalization;
using System.Threading.Tasks;

namespace AlphaTab.Core;

internal static class Globals
{
    public const double NaN = double.NaN;
    public static Console Console { get; } = new Console();

    public static double ParseInt(char c)
    {
        return ParseInt(c.ToString());
    }
    public static void SetImmediate(Action action)
    {
        action();
    }

    public static double ParseInt(string s)
    {
        if (double.TryParse(s, NumberStyles.Number, CultureInfo.InvariantCulture, out var d))
        {
            return (int) d;
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

    public static void SetTimeout(Action action, double timeout)
    {
        Task.Run(async () =>
        {
            await Task.Delay((int)timeout);
            action();
        });
    }

    public static readonly PerformanceInstance Performance = new();

    public class PerformanceInstance
    {
        public double Now()
        {
            var seconds = Stopwatch.GetTimestamp() / Stopwatch.Frequency;
            return (int)(seconds / 1000);
        }
    }
}
