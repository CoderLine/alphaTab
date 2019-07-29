using AlphaTab.Collections;

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
        public string Album { get; set; }

        /// <summary>
        /// The artist who performs this song.
        /// </summary>
        public string Artist { get; set; }

        /// <summary>
        /// The owner of the copyright of this song. 
        /// </summary>
        public string Copyright { get; set; }

        /// <summary>
        /// Additional instructions
        /// </summary>
        public string Instructions { get; set; }

        /// <summary>
        /// The author of the music. 
        /// </summary>
        public string Music { get; set; }

        /// <summary>
        /// Some additional notes about the song. 
        /// </summary>
        public string Notices { get; set; }

        /// <summary>
        /// The subtitle of the song. 
        /// </summary>
        public string SubTitle { get; set; }

        /// <summary>
        /// The title of the song. 
        /// </summary>
        public string Title { get; set; }

        /// <summary>
        /// The author of the song lyrics
        /// </summary>
        public string Words { get; set; }

        /// <summary>
        /// The author of this tablature.
        /// </summary>
        public string Tab { get; set; }

        /// <summary>
        /// Gets or sets the global tempo of the song in BPM. The tempo might change via <see cref="MasterBar.TempoAutomation"/>.
        /// </summary>
        public int Tempo { get; set; }

        /// <summary>
        /// Gets or sets the name/label of the tempo. 
        /// </summary>
        public string TempoLabel { get; set; }

        /// <summary>
        /// Gets or sets a list of all masterbars contained in this song. 
        /// </summary>
        public FastList<MasterBar> MasterBars { get; set; }

        /// <summary>
        /// Gets or sets a list of all tracks contained in this song. 
        /// </summary>
        public FastList<Track> Tracks { get; set; }

        /// <summary>
        /// Gets or sets the rendering stylesheet for this song.
        /// </summary>
        public RenderStylesheet Stylesheet { get; set; }

        /// <summary>
        /// Initializes a new instance of the <see cref="Score"/> class.
        /// </summary>
        public Score()
        {
            MasterBars = new FastList<MasterBar>();
            Tracks = new FastList<Track>();
            _currentRepeatGroup = new RepeatGroup();
            Album = Artist = Copyright =
                Instructions = Music = Notices = SubTitle = Title = Words = Tab = TempoLabel = "";
            Tempo = 120;
            Stylesheet = new RenderStylesheet();
        }

        internal static void CopyTo(Score src, Score dst)
        {
            dst.Album = src.Album;
            dst.Artist = src.Artist;
            dst.Copyright = src.Copyright;
            dst.Instructions = src.Instructions;
            dst.Music = src.Music;
            dst.Notices = src.Notices;
            dst.SubTitle = src.SubTitle;
            dst.Title = src.Title;
            dst.Words = src.Words;
            dst.Tab = src.Tab;
            dst.Tempo = src.Tempo;
            dst.TempoLabel = src.TempoLabel;
        }

        internal void RebuildRepeatGroups()
        {
            var currentGroup = new RepeatGroup();
            foreach (var bar in MasterBars)
            {
                // if the group is closed only the next upcoming header can
                // reopen the group in case of a repeat alternative, so we 
                // remove the current group 
                if (bar.IsRepeatStart || _currentRepeatGroup.IsClosed && bar.AlternateEndings <= 0)
                {
                    currentGroup = new RepeatGroup();
                }

                currentGroup.AddMasterBar(bar);
            }
        }

        internal void AddMasterBar(MasterBar bar)
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
            if (bar.IsRepeatStart || _currentRepeatGroup.IsClosed && bar.AlternateEndings <= 0)
            {
                _currentRepeatGroup = new RepeatGroup();
            }

            _currentRepeatGroup.AddMasterBar(bar);
            MasterBars.Add(bar);
        }

        internal void AddTrack(Track track)
        {
            track.Score = this;
            track.Index = Tracks.Count;
            Tracks.Add(track);
        }

        internal void Finish(Settings settings)
        {
            for (int i = 0, j = Tracks.Count; i < j; i++)
            {
                Tracks[i].Finish(settings);
            }
        }
    }
}
