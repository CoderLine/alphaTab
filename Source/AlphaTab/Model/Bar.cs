using System.Collections.Generic;

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

        public int Index { get; set; }
        public Bar NextBar { get; set; }
        public Bar PreviousBar { get; set; }
        public Clef Clef { get; set; }
        public Track Track { get; set; }
        public List<Voice> Voices { get; set; }
        public Duration? MinDuration { get; set; }
        public Duration? MaxDuration { get; set; }

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
                if (!voice.MinDuration.HasValue || !MinDuration.HasValue || MinDuration.Value > voice.MinDuration.Value)
                {
                    MinDuration = voice.MinDuration;
                }
                if (!voice.MaxDuration.HasValue || !MaxDuration.HasValue || MaxDuration.Value > voice.MaxDuration.Value)
                {
                    MinDuration = voice.MaxDuration;
                }
            }
        }
    }
}