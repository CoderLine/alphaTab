using System;
using Phase;
using Phase.Attributes;

namespace Microsoft.VisualStudio.TestTools.UnitTesting
{
    [Name("alphaTab.test.Assert")]
    static class Assert
    {
        public static void AreEqual<T1, T2>(T1 expected, T2 actual)
        {
            var expectedNull = expected == null;
            var actualNull = actual == null;

            bool equal = true;
            if (expectedNull != actualNull)
            {
                equal = false;
            }
            else if (!expectedNull)
            {
                equal = expected.Equals(actual);
            }

            if (!equal)
            {
                Fail("Value [" + (actualNull ? "null" : actual.ToString()) + "] was not equal to expected value [" + (expectedNull ? "null" : expected.ToString()) + "]");
            }
            else
            {
                Script.Write("untyped __js__(\"expect().nothing()\");");
            }
        }

        public static void AreEqual<T1, T2>(T1 expected, T2 actual, string message)
        {
            var expectedNull = expected == null;
            var actualNull = actual == null;

            bool equal = true;
            if (expectedNull != actualNull)
            {
                equal = false;
            }
            else if (!expectedNull)
            {
                equal = expected.Equals(actual);
            }

            if (!equal)
            {
                Fail(message);
            }
            else
            {
                Script.Write("untyped __js__(\"expect().nothing()\");");
            }
        }

        public static void AreEqual<T1, T2>(T1 expected, T2 actual, string message, params object[] arguments)
        {
            var expectedNull = expected == null;
            var actualNull = actual == null;

            bool equal = true;
            if (expectedNull != actualNull)
            {
                equal = false;
            }
            else if (!expectedNull)
            {
                equal = expected.Equals(actual);
            }

            if (!equal)
            {
                Fail(string.Format(message, arguments));
            }
            else
            {
                Script.Write("untyped __js__(\"expect().nothing()\");");
            }
        }

        [Inline]
        public static void Fail()
        {
            Script.Write("untyped __js__(\"fail()\");");
        }

        [Inline]
        public static void Fail(string reason)
        {
            Script.Write("untyped __js__(\"fail({0})\", reason);");
        }

        [Inline]
        public static void Fail(string reason, params object[] arguments)
        {
            var msg = string.Format(reason, arguments);
            Script.Write("untyped __js__(\"fail({0})\", msg);");
        }

        [Inline]
        public static void Inconclusive()
        {
            Script.Write("untyped __js__(\"pending()\");");
        }

        [Inline]
        public static void Inconclusive(string reason)
        {
            Script.Write("untyped __js__(\"pending({0})\", reason);");
        }

        [Inline]
        public static void Inconclusive(string reason, params object[] arguments)
        {
            var msg = string.Format(reason, arguments);
            Script.Write("untyped __js__(\"pending({0})\", msg);");
        }

        [Inline]
        public static void IsNotNull<T>(T actual) where T : class
        {
            Script.Write("untyped __js__(\"expect({0}).toBeTruthy()\", actual);");
        }

        [Inline]
        public static void IsNull<T>(T actual) where T : class
        {
            Script.Write("untyped __js__(\"expect({0}).toBeFalsy()\", actual);");
        }

        [Inline]
        public static void IsTrue(bool actual)
        {
            Script.Write("untyped __js__(\"expect({0}).toBe(true)\", actual);");

        }

        [Inline]
        public static void IsTrue(bool actual, string message)
        {
            Script.Write("untyped __js__(\"expect({0}).toBe(true)\", actual);");

        }

        [Inline]
        public static void IsFalse(bool actual)
        {
            Script.Write("untyped __js__(\"expect({0}).toBe(false)\", actual);");
        }

        [Inline]
        public static void IsFalse(bool actual, string message)
        {
            Script.Write("untyped __js__(\"expect({0}).toBe(false)\", actual);");
        }
    }
}
