using System;
using Phase.Attributes;

namespace Microsoft.VisualStudio.TestTools.UnitTesting
{
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, Inherited = false, AllowMultiple = true)]
    [Meta("@:testIgnore")]
    [External]
    internal sealed class IgnoreAttribute : Attribute
    {
        public extern IgnoreAttribute();
        public extern IgnoreAttribute(string reason);
    }
}