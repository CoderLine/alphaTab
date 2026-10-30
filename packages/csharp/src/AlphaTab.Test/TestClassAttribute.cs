﻿using System;
using System.Runtime.CompilerServices;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.VisualStudio.TestTools.UnitTesting;

// ReSharper disable once CheckNamespace
namespace AlphaTab.Test;

public class TestClassAttribute : Microsoft.VisualStudio.TestTools.UnitTesting.TestClassAttribute
{
    public string DisplayName { get; }

    public TestClassAttribute(string displayName)
    {
        DisplayName = displayName;
    }
}


public class TestMethodAttribute : Microsoft.VisualStudio.TestTools.UnitTesting.TestMethodAttribute
{
    public TestMethodAttribute(
        string displayName,
        [CallerFilePath] string callerFilePath = "",
        [CallerLineNumber] int callerLineNumber = -1
    ) : base(callerFilePath, callerLineNumber)
    {
        DisplayName = displayName;
    }

    public override async Task<TestResult[]> ExecuteAsync(ITestMethod testMethod)
    {
        TestMethodAccessor.CurrentTest = testMethod;
        var result = await base.ExecuteAsync(testMethod);
        TestMethodAccessor.CurrentTest = null;
        return result;
    }

}

public static class TestMethodAccessor
{
    private static readonly AsyncLocal<ITestMethod?> TestContextLocal = new();

    public static ITestMethod? CurrentTest
    {
        get => TestContextLocal.Value;
        set => TestContextLocal.Value = value;
    }
}
