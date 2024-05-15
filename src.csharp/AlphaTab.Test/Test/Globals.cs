using System;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace AlphaTab.Test
{
    public static class assert
    {
        public static void Fail(string message)
        {
            Assert.Fail(message);
        }
    }

    public static class TestGlobals
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

    public class NotExpector<T>
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

    public class Expector<T>
    {
        private readonly T _actual;

        public Expector(T actual)
        {
            _actual = actual;
        }

        public Expector<T> To => this;
        public NotExpector<T> Not => new(_actual);
        public Expector<T> Be => this;

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
}
