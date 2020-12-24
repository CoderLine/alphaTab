using System;
using System.Globalization;

namespace AlphaTab.Io
{
    partial class JsonWriter
    {
        private double EnumToNumber<T>(T enumValue)
        {
            if (enumValue is IConvertible c)
            {
                return c.ToDouble(CultureInfo.InvariantCulture);
            }
            return double.NaN;
        }
    }
}
