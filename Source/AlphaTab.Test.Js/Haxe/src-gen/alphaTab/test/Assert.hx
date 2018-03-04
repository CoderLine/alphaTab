package alphaTab.test;

using system.HaxeExtensions;
class Assert
{
    public static function AreEqual_T1_T22<T1, T2>(expected : T1, actual : T2) : Void 
    {
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
            alphaTab.test.Assert.Fail_CsString("Value [" + (actualNull ? "null" : system.ObjectExtensions.ToString(actual)) + "] was not equal to expected value [" + (expectedNull ? "null" : system.ObjectExtensions.ToString(expected)) + "]");
        }
        else         {
            untyped __js__("expect().nothing()");
        }
    }

    public static function AreEqual_T1_T2_CsString2<T1, T2>(expected : T1, actual : T2, message : system.CsString) : Void 
    {
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
            alphaTab.test.Assert.Fail_CsString(message);
        }
        else         {
            untyped __js__("expect().nothing()");
        }
    }

    public static function AreEqual_T1_T2_CsString_ObjectArray2<T1, T2>(expected : T1, actual : T2, message : system.CsString, arguments : system.FixedArray<system.Object>) : Void 
    {
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
            alphaTab.test.Assert.Fail_CsString(system.CsString.Format_CsString_ObjectArray(message, arguments));
        }
        else         {
            untyped __js__("expect().nothing()");
        }
    }

    public static inline function Fail() : Void 
    {
        untyped __js__("fail()");
    }

    public static inline function Fail_CsString(reason : system.CsString) : Void 
    {
        untyped __js__("fail({0})", reason);
    }

    public static inline function Fail_CsString_ObjectArray(reason : system.CsString, arguments : system.FixedArray<system.Object>) : Void 
    {
        var msg : system.CsString = system.CsString.Format_CsString_ObjectArray(reason, arguments);
        untyped __js__("fail({0})", msg);
    }

    public static inline function Inconclusive() : Void 
    {
        untyped __js__("pending()");
    }

    public static inline function Inconclusive_CsString(reason : system.CsString) : Void 
    {
        untyped __js__("pending({0})", reason);
    }

    public static inline function Inconclusive_CsString_ObjectArray(reason : system.CsString, arguments : system.FixedArray<system.Object>) : Void 
    {
        var msg : system.CsString = system.CsString.Format_CsString_ObjectArray(reason, arguments);
        untyped __js__("pending({0})", msg);
    }

    public static inline function IsNotNull<T>(actual : T) : Void 
    {
        untyped __js__("expect({0}).toBeTruthy()", actual);
    }

    public static inline function IsNull<T>(actual : T) : Void 
    {
        untyped __js__("expect({0}).toBeFalsy()", actual);
    }

    public static inline function IsTrue(actual : system.Boolean) : Void 
    {
        untyped __js__("expect({0}).toBe(true)", actual);
    }

    public static inline function IsFalse(actual : system.Boolean) : Void 
    {
        untyped __js__("expect({0}).toBe(false)", actual);
    }

}
