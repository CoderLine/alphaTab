﻿using System.Collections.Generic;

namespace AlphaTab.Model;

internal partial class ComparisonHelpers
{
    private static bool CompareObjects(object? expected, object? actual, string path,
        IList<string> ignoreKeys)
    {
        TestGlobals.Fail(
            $"cannot compare unknown object types expected[{actual?.GetType().FullName}] expected[${expected?.GetType().FullName}]");
        return false;
    }
}