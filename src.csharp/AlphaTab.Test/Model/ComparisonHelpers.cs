﻿using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;

namespace AlphaTab.Model;

internal partial class ComparisonHelpers
{
    private static IList AsUnknownArray(object? array)
    {
        return array switch
        {
            IList l => l,
            _ => throw new InvalidCastException(
                $"Unknown array type[{array?.GetType().FullName}]")
        };
    }

    private static bool CompareObjects(object? expected, object? actual, string path,
        IList<string> ignoreKeys)
    {
        TestGlobals.Fail(
            $"cannot compare unknown object types expected[{actual?.GetType().FullName}] expected[${expected?.GetType().FullName}]");
        return false;
    }
}
