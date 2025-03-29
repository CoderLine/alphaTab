using System;
using System.Collections;
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

    public static Expector<Action> Expect(Action actual)
    {
        return new Expector<Action>(actual);
    }

    public static void Fail(object? message)
    {
        Assert.Fail(Convert.ToString(message));
    }
}

internal class NotExpector<T>
{
    private readonly T _actual;
    public NotExpector<T> Be => this;

    public NotExpector(T actual)
    {
        _actual = actual;
    }

    public void Ok()
    {
        if (_actual is string s)
        {
            Assert.IsTrue(string.IsNullOrEmpty(s));
        }
        else
        {
            Assert.AreEqual(default!, _actual);
        }
    }
}

internal class Expector<T>
{
    private readonly T _actual;

    public Expector(T actual)
    {
        _actual = actual;
    }

    public Expector<T> To => this;

    public NotExpector<T> Not()
    {
        return new NotExpector<T>(_actual);
    }

    public Expector<T> Be => this;
    public Expector<T> Have => this;

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

        Assert.AreEqual(expected, _actual, message);
    }

    public void LessThan(double expected)
    {
        if (_actual is IComparable d)
        {
            Assert.IsTrue(d.CompareTo(expected) < 0, $"Expected Expected[{d}] < Actual[{_actual}]");
        }
    }

    public void GreaterThan(double expected)
    {
        if (_actual is int i)
        {
            Assert.IsTrue(i.CompareTo(expected) > 0,
                $"Expected {expected} to be greater than {_actual}");
        }

        if (_actual is double d)
        {
            Assert.IsTrue(d.CompareTo(expected) > 0,
                $"Expected {expected} to be greater than {_actual}");
        }
    }

    public void CloseTo(double expected, double delta, string? message = null)
    {
        if (_actual is IConvertible c)
        {
            Assert.AreEqual(expected,
                c.ToDouble(System.Globalization.CultureInfo.InvariantCulture), delta, message);
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

        Assert.AreEqual(expected, _actual);
    }

    public void Ok()
    {
        Assert.AreNotEqual(default!, _actual);
    }

    public void Length(int length)
    {
        if (_actual is ICollection collection)
        {
            Assert.AreEqual(length, collection.Count);
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
            CollectionAssert.Contains(collection, element);
        }
        else
        {
            Assert.Fail("Contain can only be used with collection operands");
        }
    }

    public void True()
    {
        if (_actual is bool b)
        {
            Assert.IsTrue(b);
        }
        else
        {
            Assert.Fail("ToBeTrue can only be used on bools:");
        }
    }

    public void False()
    {
        if (_actual is bool b)
        {
            Assert.IsFalse(b);
        }
        else
        {
            Assert.Fail("ToBeFalse can only be used on bools:");
        }
    }



    public void Throw(Type expected)
    {
        if (_actual is Action d)
        {
            try
            {
                d();
                Assert.Fail("Did not throw error");
            }
            catch (Exception e)
            {
                if (expected.IsInstanceOfType(e))
                {
                    return;
                }
            }

            Assert.Fail("Exception type didn't match");
        }
        else
        {
            Assert.Fail("ToThrowError can only be used with an exception");
        }
    }
}
