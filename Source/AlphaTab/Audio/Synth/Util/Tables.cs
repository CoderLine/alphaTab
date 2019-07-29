using System;
using AlphaTab.Audio.Synth.Ds;

namespace AlphaTab.Audio.Synth.Util
{
    internal class Tables
    {
        private static bool _isInitialized;

        private static SampleArray[] _envelopeTables;
        private static SampleArray _semitoneTable;
        private static SampleArray _centTable;
        private static SampleArray _sincTable;

        public static SampleArray EnvelopeTables(int index)
        {
            if (!_isInitialized)
            {
                Init();
            }

            return _envelopeTables[index];
        }

        public static float SemitoneTable(int index)
        {
            if (!_isInitialized)
            {
                Init();
            }

            return _semitoneTable[index];
        }

        public static float CentTable(int index)
        {
            if (!_isInitialized)
            {
                Init();
            }

            return _centTable[index];
        }

        public static float SincTable(int index)
        {
            if (!_isInitialized)
            {
                Init();
            }

            return _sincTable[index];
        }

        private static void Init()
        {
            var EnvelopeSize = 64;
            var ExponentialCoeff = .09f;
            _envelopeTables = new SampleArray[4];
            _envelopeTables[0] = RemoveDenormals(CreateSustainTable(EnvelopeSize));
            _envelopeTables[1] = RemoveDenormals(CreateLinearTable(EnvelopeSize));
            _envelopeTables[2] = RemoveDenormals(CreateExponentialTable(EnvelopeSize, ExponentialCoeff));
            _envelopeTables[3] = RemoveDenormals(CreateSineTable(EnvelopeSize));
            _centTable = CreateCentTable();
            _semitoneTable = CreateSemitoneTable();
            _sincTable = CreateSincTable(SynthConstants.SincWidth, SynthConstants.SincResolution, .43f, HammingWindow);
            _isInitialized = true;
        }

        private static SampleArray CreateCentTable()
        {
            //-100 to 100 cents
            var cents = new SampleArray(201);
            for (var x = 0; x < cents.Length; x++)
            {
                cents[x] = (float)Math.Pow(2.0, (x - 100.0) / 1200.0);
            }

            return cents;
        }

        private static SampleArray CreateSemitoneTable()
        {
            //-127 to 127 semitones
            var table = new SampleArray(255);
            for (var x = 0; x < table.Length; x++)
            {
                table[x] = (float)Math.Pow(2.0, (x - 127.0) / 12.0);
            }

            return table;
        }

        private static SampleArray CreateSustainTable(int size)
        {
            var table = new SampleArray(size);
            for (var x = 0; x < size; x++)
            {
                table[x] = 1;
            }

            return table;
        }

        private static SampleArray CreateLinearTable(int size)
        {
            var table = new SampleArray(size);
            for (var x = 0; x < size; x++)
            {
                table[x] = x / (float)(size - 1);
            }

            return table;
        }

        private static SampleArray CreateExponentialTable(int size, float coeff)
        {
            coeff = SynthHelper.ClampF(coeff, .001f, .9f);
            var graph = new SampleArray(size);
            var val = 0.0;
            for (var x = 0; x < size; x++)
            {
                graph[x] = (float)val;
                val += coeff * (1 / 0.63 - val);
            }

            for (var x = 0; x < size; x++)
            {
                graph[x] = graph[x] / graph[graph.Length - 1];
            }

            return graph;
        }

        private static SampleArray CreateSineTable(int size)
        {
            var graph = new SampleArray(size);
            var inc = (float)(3.0 * Math.PI / 2.0) / (size - 1);
            var phase = 0.0;
            for (var x = 0; x < size; x++)
            {
                graph[x] = (float)Math.Abs(Math.Sin(phase));
                phase += inc;
            }

            return graph;
        }

        private static SampleArray RemoveDenormals(SampleArray data)
        {
            for (var x = 0; x < data.Length; x++)
            {
                if (Math.Abs(data[x]) < SynthConstants.DenormLimit)
                {
                    data[x] = 0;
                }
            }

            return data;
        }

        private static float HammingWindow(float i, int size)
        {
            return (float)(0.54 - 0.46 * Math.Cos(SynthConstants.TwoPi * i / size));
        }

        private static SampleArray CreateSincTable(
            int windowSize,
            int resolution,
            float cornerRatio,
            Func<float, int, float> windowFunction)
        {
            var subWindow = windowSize / 2 + 1;
            var table = new SampleArray(subWindow * resolution);
            var gain = 2.0 * cornerRatio;
            for (var x = 0; x < subWindow; x++)
            {
                for (var y = 0; y < resolution; y++)
                {
                    var a = x + y / (float)resolution;
                    var sinc = SynthConstants.TwoPi * cornerRatio * a;
                    if (Math.Abs(sinc) > 0.00001)
                    {
                        sinc = Math.Sin(sinc) / sinc;
                    }
                    else
                    {
                        sinc = 1.0;
                    }

                    table[x * SynthConstants.SincResolution + y] = (float)(gain * sinc * windowFunction(a, windowSize));
                }
            }

            return table;
        }
    }
}
