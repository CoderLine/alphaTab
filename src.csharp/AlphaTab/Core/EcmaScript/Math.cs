using System;

namespace AlphaTab.Core.EcmaScript
{
    public static class Math
    {
        private static readonly Random Rnd = new Random();
        public static double PI => System.Math.PI;

        public static double Random()
        {
            return Rnd.NextDouble();
        }

        public static double Abs(double v)
        {
            return System.Math.Abs(v);
        }

        public static double Max(double a, double b)
        {
            return System.Math.Max(a, b);
        }

        public static double Min(double a, double b)
        {
            return System.Math.Min(a, b);
        }

        public static double Exp(double e)
        {
            return System.Math.Exp(e);
        }

        public static double Log(double d)
        {
            return System.Math.Log(d);
        }

        public static double Pow(double x, double y)
        {
            return System.Math.Pow(x, y);
        }

        public static double Floor(double d)
        {
            return System.Math.Floor(d);
        }

        public static double Round(double d)
        {
            return System.Math.Round(d);
        }

        public static double Sin(double a)
        {
            return System.Math.Sin(a);
        }

        public static double Log2(double d)
        {
            return System.Math.Log(d, 2);
        }

        public static double Sqrt(double d)
        {
            return System.Math.Sqrt(d);
        }

        public static double Ceil(double d)
        {
            return System.Math.Ceiling(d);
        }

        public static double Asin(double d)
        {
            return System.Math.Asin(d);
        }

        public static double Tan(double d)
        {
            return System.Math.Tan(d);
        }

        public static double Log10(double d)
        {
            return System.Math.Log10(d);
        }
    }
}
