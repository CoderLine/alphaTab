using System;
using AlphaTab.Audio.Synth.Synthesis;
using AlphaTab.Audio.Synth.Util;

namespace AlphaTab.Audio.Synth.Bank.Components
{
    enum PanFormulaEnum
    {
        Neg3dBCenter = 0,
        Neg6dBCenter = 1,
        ZeroCenter = 2
    }

    class PanComponent
    {
        public float Left { get; set; }
        public float Right { get; set; }

        public void SetValue(float value, PanFormulaEnum formula)
        {
            value = SynthHelper.ClampF(value, -1, 1);
            double dvalue;
            switch (formula)
            {
                case PanFormulaEnum.Neg3dBCenter:
                    dvalue = SynthConstants.HalfPi * (value + 1) / 2.0;
                    Left = (float)Math.Cos(dvalue);
                    Right = (float)Math.Sin(dvalue);
                    break;
                case PanFormulaEnum.Neg6dBCenter:
                    Left = (float)(.5 + value * -.5);
                    Right = (float)(.5 + value * .5);
                    break;
                case PanFormulaEnum.ZeroCenter:
                    dvalue = SynthConstants.HalfPi * (value + 1.0) / 2.0;
                    Left = (float)(Math.Cos(dvalue) / SynthConstants.InverseSqrtOfTwo);
                    Right = (float)(Math.Sin(dvalue) / SynthConstants.InverseSqrtOfTwo);
                    break;
                default:
                    throw new Exception("Invalid pan law selected.");
            }
        }
    }
}
