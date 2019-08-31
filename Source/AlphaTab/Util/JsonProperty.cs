using System;
using Phase.Attributes;

namespace AlphaTab.Util
{
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Enum, Inherited = false, AllowMultiple = false)]
    public sealed class JsonSerializableAttribute : Attribute
    {
    }
    [AttributeUsage(System.AttributeTargets.Property)]
    public sealed class JsonNameAttribute : Attribute
    {
        public string[] Names { get; }

        public JsonNameAttribute(params string[] names)
        {
            Names = names;
        }
    }
}
