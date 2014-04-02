namespace AlphaTab.Model
{
    /// <summary>
    /// This public class stores the midi specific information of a track needed
    /// for playback.
    /// </summary>
    public class PlaybackInformation
    {
        public int Volume { get; set; }
        public int Balance { get; set; }

        public int Port { get; set; }
        public int Program { get; set; }
        public int PrimaryChannel { get; set; }
        public int SecondaryChannel { get; set; }

        public bool IsMute { get; set; }
        public bool IsSolo { get; set; }

        public PlaybackInformation()
        {
            Volume = 15;
            Balance = 8;
            Port = 1;
        }
    }
}