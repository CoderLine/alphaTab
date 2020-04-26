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

        public void ToEqual<TOther>(TOther expected, string message = null)
        {
            Assert.AreEqual(expected, _actual);
        }

        public void ToBe<TOther>(TOther expected)
        {
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
            Assert.AreNotEqual(default, _actual);
        }
    }
}
