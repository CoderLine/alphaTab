using System.Collections.Generic;
using System.Runtime.CompilerServices;
using AlphaTab.Platform.Model;

namespace AlphaTab.Model
{
    /// <summary>
    /// This public class describes a single track or instrument of score
    /// </summary>
    public class Track
    {
        private const int ShortNameMaxLength = 10;

        [IntrinsicProperty]
        public int Capo { get; set; }
        [IntrinsicProperty]
        public int Index { get; set; }
        [IntrinsicProperty]
        public string Name { get; set; }
        [IntrinsicProperty]
        public string ShortName { get; set; }
        [IntrinsicProperty]
        public List<int> Tuning { get; set; }
        [IntrinsicProperty]
        public string TuningName { get; set; }
        [IntrinsicProperty]
        public Color Color { get; set; }

        [IntrinsicProperty]
        public PlaybackInformation PlaybackInfo { get; set; }
        [IntrinsicProperty]
        public bool IsPercussion { get; set; }

        [IntrinsicProperty]
        public Score Score { get; set; }
        [IntrinsicProperty]
        public List<Bar> Bars { get; set; }

        [IntrinsicProperty]
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