namespace AlphaTab.Model
{
    /// <summary>
    /// This public class contains some utilities for working with model public classes
    /// </summary>
    static public class ModelUtils
    {
        public static int GetIndex(this Duration duration)
        {
            var index = 0;
            var value = (int) duration;
            while ((value = (value >> 1)) > 0)
            {
                index++;
            }
            return index;
        }

        // TODO: Externalize this into some model public class
        public static bool KeySignatureIsFlat(int ks)
        {
            return ks < 0;
        }

        public static bool KeySignatureIsNatural(int ks)
        {
            return ks == 0;
        }

        public static bool KeySignatureIsSharp(int ks)
        {
            return ks > 0;
        }
    }
}