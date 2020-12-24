using System;

namespace AlphaTab.Io
{
    partial class JsonReader
    {
        private T ParseEnum<T>(string value, object? enumType)
        {
            return (T) System.Enum.Parse(typeof(T), value, true);
        }

        private T NumberToEnum<T>(double value)
        {
            return (T)(object)(int) value;
        }
    }
}
