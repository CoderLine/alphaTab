using System;

namespace AlphaTab.Audio.Synth.Util
{
    internal class SynthHelper
    {
        public static byte ClampB(byte value, byte min, byte max)
        {
            if (value <= min)
            {
                return min;
            }

            if (value >= max)
            {
                return max;
            }

            return value;
        }

        public static double ClampD(double value, double min, double max)
        {
            if (value <= min)
            {
                return min;
            }

            if (value >= max)
            {
                return max;
            }

            return value;
        }

        public static float ClampF(float value, float min, float max)
        {
            if (value <= min)
            {
                return min;
            }

            if (value >= max)
            {
                return max;
            }

            return value;
        }

        public static int ClampI(int value, int min, int max)
        {
            if (value <= min)
            {
                return min;
            }

            if (value >= max)
            {
                return max;
            }

            return value;
        }

        public static short ClampS(short value, short min, short max)
        {
            if (value <= min)
            {
                return min;
            }

            if (value >= max)
            {
                return max;
            }

            return value;
        }
    }
}
