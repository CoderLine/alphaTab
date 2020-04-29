using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace AlphaTab.Test
{
    public class Globals
    {
        public static Expector<T> Expect<T>(T actual)
        {
            return new Expector<T>(actual);
        }

        public static void Fail(string message)
        {
            Assert.Fail(message);
        }
    }

    public class Expector<T>
    {
        private readonly T _actual;

        public Expector(T actual)
        {
            _actual = actual;
        }

        public void ToEqual(object expected, string message = null)
        {
            if (expected is int i && _actual is double)
            {
                expected = (double)i;
            }
            Assert.AreEqual(expected, _actual, message);
        }

        public void ToBe(object expected)
        {
            if (expected is int i && _actual is double)
            {
                expected = (double)i;
            }
            Assert.AreEqual(expected, _actual);
        }

        public void ToBeTruthy()
        {
            Assert.AreNotEqual(default, _actual);
        }

        public void ToBeTrue()
        {
            if (_actual is bool b)
            {
                Assert.IsTrue(b);
            }
            else
            {
                Assert.Fail("ToBeTrue can only be used on bools");
            }
        }

        public void ToBeFalsy()
        {
            Assert.AreEqual(default, _actual);
        }
    }
}
