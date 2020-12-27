using System;
using System.Collections;
using System.Collections.Generic;

namespace AlphaTab.Io
{
    internal static partial class JsonHelper
    {
        // ReSharper disable once UnusedParameter.Global
        public static T? ParseEnum<T>(object? o, Type _) where T : struct
        {
            switch (o)
            {
                case string s:
                    return Enum.TryParse(s, true, out T value) ? value : new T?();
                case double d:
                    return (T) (object) (int) d;
                case int _:
                    return (T) o;
                case null:
                    return null;
                case T t:
                    return t;
            }

            throw new AlphaTabError(AlphaTabErrorType.Format, $"Could not parse enum value '{o}' [({o.GetType()}]");
        }

        public static void ForEach(object o, Action<object, string> func)
        {
            switch (o)
            {
                case IDictionary<string, object> d:
                    foreach (var kvp in d)
                    {
                        func(kvp.Value, kvp.Key);
                    }

                    break;
                case IDictionary d:
                    foreach (DictionaryEntry entry in d)
                    {
                        func(entry.Value, Convert.ToString(entry.Key));
                    }

                    break;
            }

            // ignore
        }
    }
}
