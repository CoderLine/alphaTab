using System;
using Phase.Attributes;

namespace Microsoft.VisualStudio.TestTools.UnitTesting
{
    [AttributeUsage(AttributeTargets.Method, Inherited = false, AllowMultiple = true)]
    [Meta("@:testMethodAsync")]
    [External]
    internal sealed class AsyncTestMethodAttribute : Attribute
    {
        public extern AsyncTestMethodAttribute();
    }
}
