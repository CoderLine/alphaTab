using Phase.Attributes;

namespace Microsoft.VisualStudio.TestTools.UnitTesting
{
    [External]
    [Name("massive.munit.Assert")]
    static class Assert
    {

        [Name("areEqual")]
        public static extern void AreEqual(object expected, object actual);
        [Name("areEqual")]
        public static extern void AreEqual<T1, T2>(T1 expected, T2 actual);
        [Template("{this}.areEqual({expected}, {actual})")]
        public static extern void AreEqual<T1, T2>(T1 expected, T2 actual, string message);
        [Template("{this}.areEqual({expected}, {actual})")]
        public static extern void AreEqual<T1, T2>(T1 expected, T2 actual, string message, params object[] arguments);
        [Name("fail")]
        public static extern void Fail();
        [Name("fail")]
        public static extern void Fail(string reason);
        [Name("fail")]
        [Template("{this}.fail(system.CsString.Format({reason}, {arguments}).ToHaxeString())")]
        public static extern void Fail(string reason, params object[] arguments);
        [Name("fail")]
        public static extern void Inconclusive();
        [Name("fail")]
        public static extern void Inconclusive(string reason);
        [Template("{this}.fail(system.CsString.Format({reason}, {arguments}).ToHaxeString())")]
        public static extern void Inconclusive(string reason, params object[] arguments);
        [Name("isNotNull")]
        public static extern void IsNotNull<T>(T actual) where T : class;
        [Name("isNull")]
        public static extern void IsNull<T>(T actual) where T : class;
        [Name("isTrue")]
        public static extern void IsTrue(bool actual);
        [Name("isTrue")]
        public static extern void IsFalse(bool actual);
    }
}
