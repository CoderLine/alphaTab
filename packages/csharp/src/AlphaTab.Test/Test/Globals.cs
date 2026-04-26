using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Reflection;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace AlphaTab.Test;
#pragma warning disable CS8981 // The type name only contains lower-cased ascii characters. Such names may become reserved for the language.
// ReSharper disable once InconsistentNaming
internal static class assert
#pragma warning restore CS8981 // The type name only contains lower-cased ascii characters. Such names may become reserved for the language.
{
    public static void Fail(string message)
    {
        Assert.Fail(message);
    }
}

internal static class TestGlobals
{
    public static Expector<T> Expect<T>(T actual)
    {
        return new Expector<T>(actual);
    }

    public static Expector<T> Expect<T>(T actual, string message)
    {
        return new Expector<T>(actual, message);
    }

    public static Expector<Action> Expect(Action actual)
    {
        return new Expector<Action>(actual);
    }

    public static void Fail(object? message)
    {
        Assert.Fail(Convert.ToString(message));
    }

    private static readonly Dictionary<string, int> SnapshotAssertionCounters = new();
    public static string UseSnapshotValue(string baseName, string hint)
    {
        if (!string.IsNullOrEmpty(hint))
        {
            baseName += $" > {hint}";
        }

        var value = SnapshotAssertionCounters.GetValueOrDefault(baseName) + 1;
        SnapshotAssertionCounters[baseName] = value;
        return $"{baseName} {value}";
    }
}

internal class NotExpector<T>
{
    private readonly T? _actual;
    private readonly string? _message;

    public NotExpector(T? actual, string? message = null)
    {
        _actual = actual;
        _message = message;
    }

    public void Equal(object? expected, string? message = null)
    {
        if (expected is int i && _actual is double)
        {
            expected = (double)i;
        }

        if (expected is double d && _actual is int)
        {
            expected = (int)d;
        }

        Assert.AreNotEqual(expected, _actual, message ?? _message);
    }

    public void Ok()
    {
        if (_actual is string s)
        {
            Assert.IsTrue(string.IsNullOrEmpty(s), _message);
        }
        else
        {
            Assert.AreEqual(default!, _actual, _message);
        }
    }

    public void ToBe(object? expected)
    {
        Equal(expected);
    }

    public void ToEqual(object? expected, string? message = null)
    {
        Equal(expected, message);
    }

    public void ToBeTruthy()
    {
        Ok();
    }

    public void ToBeFalsy()
    {
        if (_actual is null)
        {
            Assert.Fail(_message ?? "Expected non-falsy value");
            return;
        }
        if (_actual is bool b)
        {
            Assert.IsTrue(b, _message);
            return;
        }
        if (_actual is string s)
        {
            Assert.IsFalse(string.IsNullOrEmpty(s), _message);
            return;
        }
        if (_actual is IConvertible c)
        {
            Assert.AreNotEqual(0.0, c.ToDouble(System.Globalization.CultureInfo.InvariantCulture), _message);
            return;
        }
    }

    public void ToContain(object element)
    {
        if (_actual is ICollection collection)
        {
            CollectionAssert.DoesNotContain(collection, element, _message);
        }
        else
        {
            Assert.Fail("Contain can only be used with collection operands");
        }
    }

    public void ToHaveLength(int length)
    {
        if (_actual is ICollection collection)
        {
            Assert.AreNotEqual(length, collection.Count, _message);
        }
        else
        {
            Assert.Fail("Length can only be used with collection operands");
        }
    }

    public void ToBeGreaterThan(double expected)
    {
        if (_actual is IComparable d)
        {
            Assert.IsFalse(d.CompareTo(expected) > 0, _message);
        }
    }

    public void ToBeLessThan(double expected)
    {
        if (_actual is IComparable d)
        {
            Assert.IsFalse(d.CompareTo(expected) < 0, _message);
        }
    }

    public void ToBeNull()
    {
        Assert.IsNotNull(_actual, _message);
    }

    public void ToBeUndefined()
    {
        Assert.IsNotNull(_actual, _message);
    }

    public void ToBeInstanceOf(Type expected)
    {
        Assert.IsNotInstanceOfType(_actual, expected, _message);
    }
}

internal class Expector<T>
{
    private readonly T? _actual;
    private readonly string? _message;

    public Expector(T? actual, string? message = null)
    {
        _actual = actual;
        _message = message;
    }

    public NotExpector<T> Not()
    {
        return new NotExpector<T>(_actual, _message);
    }

    public void Equal(object? expected, string? message = null)
    {
        if (expected is int i && _actual is double)
        {
            expected = (double)i;
        }

        if (expected is double d && _actual is int)
        {
            expected = (int)d;
        }

        Assert.AreEqual(expected, _actual, message ?? _message);
    }

    public void LessThan(double expected)
    {
        if (_actual is IComparable d)
        {
            Assert.IsTrue(d.CompareTo(expected) < 0, _message ?? $"Expected Expected[{d}] < Actual[{_actual}]");
        }
    }

    public void GreaterThan(double expected, string? message = null)
    {
        if (_actual is int i)
        {
            Assert.IsTrue(i > expected,
                _message ?? message ??
                $"Expected {expected} to be greater than {_actual}");
        }

        if (_actual is double d)
        {
            Assert.IsTrue(d.CompareTo(expected) > 0,
                _message ?? message ??
                $"Expected {expected} to be greater than {_actual}");
        }
    }

    public void CloseTo(double expected, double delta, string? message = null)
    {
        if (_actual is IConvertible c)
        {
            Assert.AreEqual(expected,
                c.ToDouble(System.Globalization.CultureInfo.InvariantCulture), delta, message ?? _message);
        }
        else
        {
            Assert.Fail("ToBeCloseTo can only be used with numeric operands");
        }
    }

    public void ToBe(object expected)
    {
        if (expected is int i && _actual is double)
        {
            expected = (double)i;
        }

        if (expected is double d && _actual is int)
        {
            expected = (int)d;
        }

        Assert.AreEqual(expected, _actual, _message);
    }

    public void ToBeTruthy()
    {
        Ok();
    }

    public void ToBeFalsy()
    {
        if (_actual is null)
        {
            return;
        }
        if (_actual is bool b)
        {
            Assert.IsFalse(b, _message);
            return;
        }
        if (_actual is string s)
        {
            Assert.IsTrue(string.IsNullOrEmpty(s), _message);
            return;
        }
        if (_actual is IConvertible c)
        {
            Assert.AreEqual(0.0, c.ToDouble(System.Globalization.CultureInfo.InvariantCulture), _message);
            return;
        }
        Assert.Fail(_message ?? "Expected a falsy value");
    }

    public void ToBeCloseTo(double expected, int decimals = 2)
    {
        var delta = System.Math.Pow(10, -decimals) / 2;
        CloseTo(expected, delta);
    }

    public void ToContain(object element)
    {
        Contain(element);
    }

    public void ToHaveLength(int length)
    {
        Length(length);
    }

    public void ToBeGreaterThan(double expected, string? message = null)
    {
        GreaterThan(expected, message);
    }

    public void ToBeLessThan(double expected)
    {
        LessThan(expected);
    }

    public void ToBeInstanceOf(Type expected)
    {
        Assert.IsInstanceOfType(_actual, expected, _message);
    }

    public void ToBeNull()
    {
        Assert.IsNull(_actual, _message);
    }

    public void ToBeUndefined()
    {
        Assert.IsNull(_actual, _message);
    }

    public void ToThrow(Type expected)
    {
        Throw(expected);
    }

    public void Ok()
    {
        Assert.AreNotEqual(default!, _actual, _message);
    }

    public void Length(int length)
    {
        if (_actual is ICollection collection)
        {
            Assert.AreEqual(length, collection.Count, _message);
        }
        else
        {
            Assert.Fail("Length can only be used with collection operands");
        }
    }

    public void Contain(object element)
    {
        if (_actual is ICollection collection)
        {
            CollectionAssert.Contains(collection, element, _message);
        }
        else
        {
            Assert.Fail("Contain can only be used with collection operands");
        }
    }



    public void Throw(Type expected)
    {
        if (_actual is Action d)
        {
            try
            {
                d();
                Assert.Fail(_message ?? "Did not throw error");
            }
            catch (Exception e)
            {
                if (expected.IsInstanceOfType(e))
                {
                    return;
                }
            }

            Assert.Fail(_message ?? "Exception type didn't match");
        }
        else
        {
            Assert.Fail("ToThrowError can only be used with an exception");
        }
    }

    public void ToMatchSnapshot(string hint = "")
    {
        var testMethodInfo = TestMethodAccessor.CurrentTest;
        Assert.IsNotNull(testMethodInfo,
            "No information about current test available, cannot find test snapshot");

        var file = testMethodInfo.MethodInfo.GetCustomAttribute<SnapshotFileAttribute>()?.Path;
        if (string.IsNullOrEmpty(file))
        {
            Assert.Fail("Missing SnapshotFileAttribute with path to .snap file");
        }

        var absoluteSnapFilePath = Path.GetFullPath(Path.Join(
            TestPlatform.AlphaTabProjectRoot.Value,
            file
        ));
        if (!File.Exists(absoluteSnapFilePath))
        {
            Assert.Fail("Could not find snapshot file at " + absoluteSnapFilePath);
        }

        var snapshotFile = SnapshotFileRepository.LoadSnapshotFile(absoluteSnapFilePath);

        var parts = new Collections.List<string>();
        CollectTestSuiteNames(parts, testMethodInfo.MethodInfo.DeclaringType!);
        var testName = testMethodInfo.MethodInfo.GetCustomAttribute<TestMethodAttribute>()!
            .DisplayName;
        parts.Add(testName ?? "");

        var snapshotName = TestGlobals.UseSnapshotValue(string.Join(" > ", parts), hint);

        var error = snapshotFile.Match(snapshotName, _actual);
        if (!string.IsNullOrEmpty(error))
        {
            Assert.Fail((_message ?? "") + error);
        }
    }

    private static void CollectTestSuiteNames(Collections.List<string> parts, Type testClass)
    {
        if (testClass.DeclaringType is not null)
        {
            CollectTestSuiteNames(parts, testClass.DeclaringType!);
        }

        var testSuiteName = testClass.GetCustomAttribute<TestClassAttribute>()?.DisplayName ??
                            testClass.Name;
        parts.Add(testSuiteName);
    }
}
