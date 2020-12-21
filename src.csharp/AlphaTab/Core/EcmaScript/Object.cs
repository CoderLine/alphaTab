using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;

namespace AlphaTab.Core.EcmaScript
{
    internal static class Object
    {
        public static IList<string> Keys(object p)
        {
            if (p is IDictionary d)
            {
                return d.Keys.OfType<object>().Select(o => o.ToString()).ToList();
            }

            return p.GetType()
                .GetProperties(BindingFlags.Instance | BindingFlags.Public)
                .Select(prop => prop.Name)
                .ToList();
        }
    }
}
