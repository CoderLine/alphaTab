using System;
using Phase.Attributes;

namespace Microsoft.VisualStudio.TestTools.UnitTesting
{
    [AttributeUsage(AttributeTargets.Class, Inherited = false, AllowMultiple = true)]
    [External]
    [Meta("@:testClass")]
    internal sealed class TestClassAttribute : Attribute
    {
    }
}