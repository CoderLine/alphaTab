using System;
using AlphaTab.Audio.Synth.Bank.Descriptors;
using AlphaTab.Audio.Synth.Ds;
using AlphaTab.Audio.Synth.Util;

namespace AlphaTab.Audio.Synth.Bank.Components
{
    internal enum FilterType
    {
        None = 0,
        BiquadLowpass = 1,
        BiquadHighpass = 2,
        OnePoleLowpass = 3
    }

    internal class Filter
    {
        private float _a1;
        private float _a2;

        private float _b1;
        private float _b2;

        private float _m1;
        private float _m2;
        private float _m3;
        private double _cutOff;
        private double _resonance;

        public FilterType FilterMethod { get; private set; }

        public double CutOff
        {
            get => _cutOff;
            set
            {
                _cutOff = value;
                CoeffNeedsUpdating = true;
            }
        }

        public double Resonance
        {
            get => _resonance;
            set
            {
                _resonance = value;
                CoeffNeedsUpdating = true;
            }
        }

        public bool Enabled => FilterMethod != FilterType.None;

        public bool CoeffNeedsUpdating { get; private set; }

        public Filter()
        {
            _a1 = 0;
            _a2 = 0;
            _b1 = 0;
            _b2 = 0;
            _m1 = 0;
            _m2 = 0;
            _m3 = 0;
            FilterMethod = FilterType.None;
            CutOff = 0;
            Resonance = 0;
        }

        public void Disable()
        {
            FilterMethod = FilterType.None;
        }

        public void QuickSetup(int sampleRate, int note, float velocity, FilterDescriptor filterInfo)
        {
            CoeffNeedsUpdating = false;
            CutOff = filterInfo.CutOff;
            Resonance = filterInfo.Resonance;
            FilterMethod = filterInfo.FilterMethod;
            _a1 = 0;
            _a2 = 0;
            _b1 = 0;
            _b2 = 0;
            _m1 = 0;
            _m2 = 0;
            _m3 = 0;
            if (CutOff <= 0 || Resonance <= 0)
            {
                FilterMethod = FilterType.None;
            }

            if (FilterMethod != FilterType.None)
            {
                CutOff *= SynthHelper.CentsToPitch((note - filterInfo.RootKey) * filterInfo.KeyTrack +
                                                   (int)(velocity * filterInfo.VelTrack));
                UpdateCoefficients(sampleRate);
            }
        }

        public float ApplyFilter(float sample)
        {
            switch (FilterMethod)
            {
                case FilterType.BiquadHighpass:
                case FilterType.BiquadLowpass:
                    _m3 = sample - _a1 * _m1 - _a2 * _m2;
                    sample = _b2 * (_m3 + _m2) + _b1 * _m1;
                    _m2 = _m1;
                    _m1 = _m3;
                    return sample;
                case FilterType.OnePoleLowpass:
                    _m1 += _a1 * (sample - _m1);
                    return _m1;
                default:
                    return 0f;
            }
        }

        public void ApplyFilter(SampleArray data)
        {
            switch (FilterMethod)
            {
                case FilterType.BiquadHighpass:
                case FilterType.BiquadLowpass:
                    for (var x = 0; x < data.Length; x++)
                    {
                        _m3 = data[x] - _a1 * _m1 - _a2 * _m2;
                        data[x] = _b2 * (_m3 + _m2) + _b1 * _m1;
                        _m2 = _m1;
                        _m1 = _m3;
                    }

                    break;
                case FilterType.OnePoleLowpass:
                    for (var x = 0; x < data.Length; x++)
                    {
                        _m1 += _a1 * (data[x] - _m1);
                        data[x] = _m1;
                    }

                    break;
            }
        }

        public void ApplyFilterInterp(SampleArray data, int sampleRate)
        {
            var ic = GenerateFilterCoeff(CutOff / sampleRate, Resonance);
            var a1Inc = (ic[0] - _a1) / data.Length;
            var a2Inc = (ic[1] - _a2) / data.Length;
            var b1Inc = (ic[2] - _b1) / data.Length;
            var b2Inc = (ic[3] - _b2) / data.Length;
            switch (FilterMethod)
            {
                case FilterType.BiquadHighpass:
                case FilterType.BiquadLowpass:
                    for (var x = 0; x < data.Length; x++)
                    {
                        _a1 += a1Inc;
                        _a2 += a2Inc;
                        _b1 += b1Inc;
                        _b2 += b2Inc;
                        _m3 = data[x] - _a1 * _m1 - _a2 * _m2;
                        data[x] = _b2 * (_m3 + _m2) + _b1 * _m1;
                        _m2 = _m1;
                        _m1 = _m3;
                    }

                    _a1 = ic[0];
                    _a2 = ic[1];
                    _b1 = ic[2];
                    _b2 = ic[3];
                    break;
                case FilterType.OnePoleLowpass:
                    for (var x = 0; x < data.Length; x++)
                    {
                        _a1 += a1Inc;
                        _m1 += _a1 * (data[x] - _m1);
                        data[x] = _m1;
                    }

                    _a1 = ic[0];
                    break;
            }

            CoeffNeedsUpdating = false;
        }

        public void UpdateCoefficients(int sampleRate)
        {
            var coeff = GenerateFilterCoeff(CutOff / sampleRate, Resonance);
            _a1 = coeff[0];
            _a2 = coeff[1];
            _b1 = coeff[2];
            _b2 = coeff[3];
            CoeffNeedsUpdating = false;
        }

        private float[] GenerateFilterCoeff(double fc, double q)
        {
            fc = SynthHelper.ClampD(fc, SynthConstants.DenormLimit, .49);
            var coeff = new float[4];
            switch (FilterMethod)
            {
                case FilterType.BiquadLowpass:
                {
                    var w0 = SynthConstants.TwoPi * fc;
                    var cosw0 = Math.Cos(w0);
                    var alpha = Math.Sin(w0) / (2.0 * q);
                    var a0Inv = 1.0 / (1.0 + alpha);
                    coeff[0] = (float)(-2.0 * cosw0 * a0Inv);
                    coeff[1] = (float)((1.0 - alpha) * a0Inv);
                    coeff[2] = (float)((1.0 - cosw0) * a0Inv * (1.0 / Math.Sqrt(q)));
                    coeff[3] = _b1 * 0.5f;
                }
                    break;
                case FilterType.BiquadHighpass:
                {
                    var w0 = SynthConstants.TwoPi * fc;
                    var cosw0 = Math.Cos(w0);
                    var alpha = Math.Sin(w0) / (2.0 * q);
                    var a0Inv = 1.0 / (1.0 + alpha);
                    var qinv = 1.0 / Math.Sqrt(q);
                    coeff[0] = (float)(-2.0 * cosw0 * a0Inv);
                    coeff[1] = (float)((1.0 - alpha) * a0Inv);
                    coeff[2] = (float)((-1.0 - cosw0) * a0Inv * qinv);
                    coeff[3] = (float)((1.0 + cosw0) * a0Inv * qinv * 0.5);
                }
                    break;
                case FilterType.OnePoleLowpass:
                    coeff[0] = 1.0f - (float)Math.Exp(-2.0 * Math.PI * fc);
                    break;
            }

            return coeff;
        }
    }
}
