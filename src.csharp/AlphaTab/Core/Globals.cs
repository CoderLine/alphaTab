using System;
using System.Diagnostics;
using System.Globalization;
using System.Threading.Tasks;

namespace AlphaTab.Core;

internal static class Globals
{
    public static Console Console { get; } = new Console();


    public static void SetImmediate(Action action)
    {
        action();
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
