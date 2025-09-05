using System;
using System.Threading;
using Microsoft.VisualStudio.TestTools.UnitTesting;

// ReSharper disable once CheckNamespace
namespace AlphaTab.Test;

public class TestClassAttribute : Microsoft.VisualStudio.TestTools.UnitTesting.TestClassAttribute
{
}

public class TestMethodAttribute : Microsoft.VisualStudio.TestTools.UnitTesting.TestMethodAttribute
{
    public TestMethodAttribute(string displayName) : base(displayName)
    {
    }

    public override TestResult[] Execute(ITestMethod testMethod)
    {
        TestMethodAccessor.CurrentTest = testMethod;
        GlobalBeforeTest?.Invoke();
        var result = base.Execute(testMethod);
        TestMethodAccessor.CurrentTest = null;
        return result;
    }

    public static event Action? GlobalBeforeTest;
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
