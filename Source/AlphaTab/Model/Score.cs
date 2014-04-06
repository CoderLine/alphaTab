using System.Collections.Generic;
using System.Runtime.CompilerServices;

namespace AlphaTab.Model
{
    /// <summary>
    /// The score is the root node of the complete 
    /// model. It stores the basic information of 
    /// a song and stores the sub components. 
    /// </summary>
    public class Score
    {
        private RepeatGroup _currentRepeatGroup;

        /// <summary>
        /// The album of this song. 
        /// </summary>
        [IntrinsicProperty]
        public string Album { get; set; }

        /// <summary>
        /// The artist who performs this song.
        /// </summary>
        [IntrinsicProperty]
        public string Artist { get; set; }

        /// <summary>
        /// The owner of the copyright of this song. 
        /// </summary>
        [IntrinsicProperty]
        public string Copyright { get; set; }

        /// <summary>
        /// Additional instructions
        /// </summary>
        [IntrinsicProperty]
        public string Instructions { get; set; }

        /// <summary>
        /// The author of the music. 
        /// </summary>
        [IntrinsicProperty]
        public string Music { get; set; }

        /// <summary>
        /// Some additional notes about the song. 
        /// </summary>
        [IntrinsicProperty]
        public string Notices { get; set; }

        /// <summary>
        /// The subtitle of the song. 
        /// </summary>
        [IntrinsicProperty]
        public string SubTitle { get; set; }

        /// <summary>
        /// The title of the song. 
        /// </summary>
        [IntrinsicProperty]
        public string Title { get; set; }

        /// <summary>
        /// The author of the song lyrics
        /// </summary>
        [IntrinsicProperty]
        public string Words { get; set; }

        /// <summary>
        /// The author of this tablature.
        /// </summary>
        [IntrinsicProperty]
        public string Tab { get; set; }

        [IntrinsicProperty]
        public int Tempo { get; set; }
        [IntrinsicProperty]
        public string TempoLabel { get; set; }

        [IntrinsicProperty]
        public List<MasterBar> MasterBars { get; set; }
        [IntrinsicProperty]
        public List<Track> Tracks { get; set; }

        public Score()
        {
            MasterBars = new List<MasterBar>();
            Tracks = new List<Track>();
            _currentRepeatGroup = new RepeatGroup();
        }

        public void AddMasterBar(MasterBar bar)
        {
            bar.Score = this;
            bar.Index = MasterBars.Count;
            if (MasterBars.Count != 0)
            {
                bar.PreviousMasterBar = MasterBars[MasterBars.Count - 1];
                bar.PreviousMasterBar.NextMasterBar = bar;
                bar.Start = bar.PreviousMasterBar.Start + bar.PreviousMasterBar.CalculateDuration();
            }

            // if the group is closed only the next upcoming header can
            // reopen the group in case of a repeat alternative, so we 
            // remove the current group 
            if (bar.IsRepeatStart || (_currentRepeatGroup.IsClosed && bar.AlternateEndings <= 0))
            {
                _currentRepeatGroup = new RepeatGroup();
            }
            _currentRepeatGroup.AddMasterBar(bar);
            MasterBars.Add(bar);
        }

        public void AddTrack(Track track)
        {
            track.Score = this;
            track.Index = Tracks.Count;
            Tracks.Add(track);
        }

        public void Finish()
        {
            foreach (Track track in Tracks)
            {
                track.Finish();
            }
        }

    }
}