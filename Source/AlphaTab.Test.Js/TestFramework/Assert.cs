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
            Script.Write("massive.munit.Assert.assertionCount++;");

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
        }
        public static void AreEqual<T1, T2>(T1 expected, T2 actual, string message)
        {
            Script.Write("massive.munit.Assert.assertionCount++;");

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
        }

        public static void AreEqual<T1, T2>(T1 expected, T2 actual, string message, params object[] arguments)
        {
            Script.Write("massive.munit.Assert.assertionCount++;");

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
        }

        [Template("massive.munit.Assert.fail()")]
        public static extern void Fail();
        [Template("massive.munit.Assert.fail({reason}.ToHaxeString())")]
        public static extern void Fail(string reason);
        [Template("massive.munit.Assert.fail(system.CsString.Format({reason}, {arguments}).ToHaxeString())")]
        public static extern void Fail(string reason, params object[] arguments);
        [Template("massive.munit.Assert.fail()")]
        public static extern void Inconclusive();
        [Template("massive.munit.Assert.fail({reason}.ToHaxeString())")]
        public static extern void Inconclusive(string reason);
        [Template("massive.munit.Assert.fail(system.CsString.Format({reason}, {arguments}).ToHaxeString())")]
        public static extern void Inconclusive(string reason, params object[] arguments);
        [Template("massive.munit.Assert.isNotNull({actual})")]
        public static extern void IsNotNull<T>(T actual) where T : class;
        [Template("massive.munit.Assert.isNull({actual})")]
        public static extern void IsNull<T>(T actual) where T : class;
        [Template("massive.munit.Assert.isTrue({actual})")]
        public static extern void IsTrue(bool actual);
        [Template("massive.munit.Assert.isTrue({actual})")]
        public static extern void IsFalse(bool actual);
    }
}
