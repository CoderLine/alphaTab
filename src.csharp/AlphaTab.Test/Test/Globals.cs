using System;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace AlphaTab.Test
{
    public static class Globals
    {
        public static Expector<T> Expect<T>(T actual)
        {
            return new Expector<T>(actual);
        }

        public static void Fail(object? message)
        {
            Assert.Fail(Convert.ToString(message));
        }
    }

    public class Expector<T>
    {
        private readonly T _actual;
        private string _message;

        public Expector(T actual)
        {
            _actual = actual;
            _message = string.Empty;
        }

        public Expector<T> WithContext(string message)
        {
            _message = message;
            return this;
        }

        public void ToEqual(object expected, string? message = null)
        {
            if (expected is int i && _actual is double)
            {
                expected = (double)i;
            }
            Assert.AreEqual(expected, _actual, _message + message);
        }

        public void ToBeCloseTo(double expected, string? message = null)
        {
            if (_actual is IConvertible c)
            {
                Assert.AreEqual(expected, c.ToDouble(System.Globalization.CultureInfo.InvariantCulture), 0.001, _message + message);
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
            Assert.AreEqual(expected, _actual, _message);
        }

        public void ToBeTruthy()
        {
            Assert.AreNotEqual(default!, _actual, _message);
        }

        public void ToBeTrue()
        {
            if (_actual is bool b)
            {
                Assert.IsTrue(b, _message);
            }
            else
            {
                Assert.Fail("ToBeTrue can only be used on bools:" + _message);
            }
        }

        public void ToBeFalsy()
        {
            Assert.AreEqual(default!, _actual, _message);
        }
    }
}
