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
            throw new System.NotImplementedException();
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
            throw new System.NotImplementedException();
        }

        public void ToBeTrue()
        {
            throw new System.NotImplementedException();
        }

        public void ToBeFalsy()
        {
            throw new System.NotImplementedException();
        }
    }
}
