using System.Collections;

namespace AlphaTab.Core.EcmaScript
{
    internal static class Array
    {
        public static bool IsArray(object? o)
        {
            return o is IList;
        }
    }
}
