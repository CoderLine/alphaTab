using System.Collections.Generic;
using System.Runtime.InteropServices;
using AlphaTab.Model;

namespace AlphaTab.Rendering.Utils
{
    public class TupletHelper
    {
        private bool _isFinished;

        public List<Beat> Beats { get; set; }
        public int VoiceIndex { get; set; }
        public int Tuplet { get; set; }

        public TupletHelper(int voice)
        {
            VoiceIndex = voice;
            Beats = new List<Beat>();
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
