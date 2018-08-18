using System;
using Phase.Attributes;

namespace Microsoft.VisualStudio.TestTools.UnitTesting
{
    [AttributeUsage(AttributeTargets.Method, Inherited = false, AllowMultiple = true)]
    [External]
    [Meta("@:testMethod")]
    sealed class TestMethodAttribute : Attribute
    {
    }
}
