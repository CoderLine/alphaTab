using System.Runtime.CompilerServices;
using AlphaTab.Collections;
using AlphaTab.Model;

namespace AlphaTab.Rendering.Utils
{
    public class TupletHelper
    {
        private bool _isFinished;

        [IntrinsicProperty]
        public FastList<Beat> Beats { get; set; }
        [IntrinsicProperty]
        public int VoiceIndex { get; set; }
        [IntrinsicProperty]
        public int Tuplet { get; set; }

        public TupletHelper(int voice)
        {
            VoiceIndex = voice;
            Beats = new FastList<Beat>();
        }

        public bool IsFull
        {
            get
            {
                return Beats.Count == Tuplet;
            }
        }

        public void Finish()
        {
            _isFinished = true;
        }

        public bool Check(Beat beat)
        {
            if (Beats.Count == 0)
            {
                Tuplet = beat.TupletNumerator;
            }
            else if (beat.Voice.Index != VoiceIndex || beat.TupletNumerator != Tuplet || IsFull || _isFinished)
            {
                return false;
            }
            Beats.Add(beat);
            return true;
        }
    }
}
