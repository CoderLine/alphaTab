using System;

namespace AlphaTab.Audio.Synth.Util
{
    internal class SynthHelper
    {
        public static void SwapEndianess(byte[] data, int bits)
        {
            bits /= 8; //get bytes per sample
            var swapArray = new byte[bits];
            for (var x = 0; x < data.Length; x += bits)
            {
                Platform.Platform.BlockCopy(data, x, swapArray, 0, bits);
                Platform.Platform.Reverse(swapArray);
                Platform.Platform.BlockCopy(swapArray, 0, data, x, bits);
            }
        }

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

        public static double NearestPowerOfTwo(double value)
        {
            return Math.Pow(2, Math.Round(Math.Log(value, 2)));
        }

        public static double SamplesFromTime(int sampleRate, double seconds)
        {
            return sampleRate * seconds;
        }

        public static double TimeFromSamples(int sampleRate, int samples)
        {
            return samples / (double)sampleRate;
        }

        public static double DBtoLinear(double dBvalue)
        {
            return Math.Pow(10.0, dBvalue / 20.0);
        }

        public static double LineartoDB(double linearvalue)
        {
            return 20.0 * Math.Log10(linearvalue);
        }

        //Midi Note and Frequency Conversions
        public static double FrequencyToKey(double frequency, int rootkey)
        {
            return 12.0 * Math.Log(frequency / 440.0, 2.0) + rootkey;
        }

        public static double KeyToFrequency(double key, int rootkey)
        {
            return Math.Pow(2.0, (key - rootkey) / 12.0) * 440.0;
        }

        public static double SemitoneToPitch(int key)
        {
            //does not return a frequency, only the 2^(1/12) value.
            if (key < -127)
            {
                key = -127;
            }
            else if (key > 127)
            {
                key = 127;
            }

            return Tables.SemitoneTable(127 + key);
        }

        public static double CentsToPitch(int cents)
        {
            //does not return a frequency, only the 2^(1/12) value.
            var key = cents / 100;
            cents -= key * 100;
            if (key < -127)
            {
                key = -127;
            }
            else if (key > 127)
            {
                key = 127;
            }

            return Tables.SemitoneTable(127 + key) * Tables.CentTable(100 + cents);
        }
    }
}
