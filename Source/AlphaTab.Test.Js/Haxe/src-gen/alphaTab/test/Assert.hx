package alphaTab.test;

using system.HaxeExtensions;
class Assert
{
    public static function AreEqual_T1_T22<T1, T2>(expected : T1, actual : T2) : Void 
    {
        massive.munit.Assert.assertionCount++;
        var expectedNull : system.Boolean = expected == null;
        var actualNull : system.Boolean = actual == null;
        var equal : system.Boolean = true;
        if (expectedNull != actualNull)
        {
            equal = false;
        }
        else if (!expectedNull)
        {
            equal = system.ObjectExtensions.Equals_Object(expected, actual);
        }
        if (!equal)
        {
            massive.munit.Assert.fail("Value [" + (actualNull ? "null" : system.ObjectExtensions.ToString(actual)) + "] was not equal to expected value [" + (expectedNull ? "null" : system.ObjectExtensions.ToString(expected)) + "]".ToHaxeString());
        }
    }

    public static function AreEqual_T1_T2_CsString2<T1, T2>(expected : T1, actual : T2, message : system.CsString) : Void 
    {
        massive.munit.Assert.assertionCount++;
        var expectedNull : system.Boolean = expected == null;
        var actualNull : system.Boolean = actual == null;
        var equal : system.Boolean = true;
        if (expectedNull != actualNull)
        {
            equal = false;
        }
        else if (!expectedNull)
        {
            equal = system.ObjectExtensions.Equals_Object(expected, actual);
        }
        if (!equal)
        {
            massive.munit.Assert.fail(message.ToHaxeString());
        }
    }

    public static function AreEqual_T1_T2_CsString_ObjectArray2<T1, T2>(expected : T1, actual : T2, message : system.CsString, arguments : system.FixedArray<system.Object>) : Void 
    {
        massive.munit.Assert.assertionCount++;
        var expectedNull : system.Boolean = expected == null;
        var actualNull : system.Boolean = actual == null;
        var equal : system.Boolean = true;
        if (expectedNull != actualNull)
        {
            equal = false;
        }
        else if (!expectedNull)
        {
            equal = system.ObjectExtensions.Equals_Object(expected, actual);
        }
        if (!equal)
        {
            massive.munit.Assert.fail(system.CsString.Format_CsString_ObjectArray(message, arguments).ToHaxeString());
        }
    }

}
