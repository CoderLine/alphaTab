using System;
using Phase.Attributes;

namespace Microsoft.VisualStudio.TestTools.UnitTesting
{
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, Inherited = false, AllowMultiple = true)]
    [Meta("@Ignore(\"ignored\")")]
    [External]
    sealed class IgnoreAttribute : Attribute
    {
    }
}