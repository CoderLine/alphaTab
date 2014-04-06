using System.Collections.Generic;
using System.Runtime.CompilerServices;
using AlphaTab.Platform;

namespace AlphaTab.Model
{
    /// <summary>
    /// A bar is a single block within a track, also known as Measure.
    /// </summary>
    public class Bar
    {
        public Bar()
        {
            Voices = new List<Voice>();
            Clef = Clef.G2;
        }

        [IntrinsicProperty]
        public int Index { get; set; }
        [IntrinsicProperty]
        public Bar NextBar { get; set; }
        [IntrinsicProperty]
        public Bar PreviousBar { get; set; }
        [IntrinsicProperty]
        public Clef Clef { get; set; }
        [IntrinsicProperty]
        public Track Track { get; set; }
        [IntrinsicProperty]
        public List<Voice> Voices { get; set; }
        [IntrinsicProperty]
        public Nullable<Duration> MinDuration { get; set; }
        [IntrinsicProperty]
        public Nullable<Duration> MaxDuration { get; set; }

        public void AddVoice(Voice voice)
        {
            voice.Bar = this;
            voice.Index = Voices.Count;
            Voices.Add(voice);
        }

        public MasterBar MasterBar
        {
            get
            {
                return Track.Score.MasterBars[Index];
            }
        }


        public bool IsEmpty
        {
            get
            {
                foreach (var voice in Voices)
                {
                    if (!voice.IsEmpty)
                    {
                        return false;
                    }
                }
                return true;
            }
        }


        public void Finish()
        {
            foreach (var voice in Voices)
            {
                voice.Finish();
                if (voice.MinDuration == null || MinDuration == null || MinDuration.Value > voice.MinDuration.Value)
                {
                    MinDuration = voice.MinDuration;
                }
                if (voice.MaxDuration == null || MaxDuration == null || MaxDuration.Value > voice.MaxDuration.Value)
                {
                    MinDuration = voice.MaxDuration;
                }
            }
        }
    }
}