using System.Collections.Generic;
using AlphaTab.Platform.Model;

namespace AlphaTab.Model
{
    /// <summary>
    /// This public class describes a single track or instrument of score
    /// </summary>
    public class Track
    {
        private const int ShortNameMaxLength = 10;
        public int Capo { get; set; }
        public int Index { get; set; }
        public string Name { get; set; }
        public string ShortName { get; set; }
        public List<int> Tuning { get; set; }
        public string TuningName { get; set; }
        public Color Color { get; set; }

        public PlaybackInformation PlaybackInfo { get; set; }
        public bool IsPercussion { get; set; }

        public Score Score { get; set; }
        public List<Bar> Bars { get; set; }

        public Dictionary<string, Chord> Chords { get; set; }

        public Track()
        {
            Name = "";
            ShortName = "";
            Tuning = new List<int>();
            Bars = new List<Bar>();
            Chords = new Dictionary<string, Chord>();
            PlaybackInfo = new PlaybackInformation();
            Color = new Color(200, 0, 0);
        }

        public void AddBar(Bar bar)
        {
            bar.Track = this;
            bar.Index = Bars.Count;
            if (Bars.Count > 0)
            {
                bar.PreviousBar = Bars[Bars.Count - 1];
                bar.PreviousBar.NextBar = bar;
            }
            Bars.Add(bar);
        }

        public void Finish()
        {
            if (string.IsNullOrEmpty(ShortName))
            {
                ShortName = Name;
                if (ShortName.Length > ShortNameMaxLength)
                    ShortName = ShortName.Substring(0, ShortNameMaxLength);
            }

            foreach (Bar bar in Bars)
            {
                bar.Finish();
            }
        }
    }
}