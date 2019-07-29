namespace AlphaTab.Model
{
    /// <summary>
    /// This public class stores the midi specific information of a track needed
    /// for playback.
    /// </summary>
    public class PlaybackInformation
    {
        /// <summary>
        /// Gets or sets the volume (0-16)
        /// </summary>
        public int Volume { get; set; }
        /// <summary>
        /// Gets or sets the balance (0-16; 8=center)
        /// </summary>
        public int Balance { get; set; }

        /// <summary>
        /// Gets or sets the midi port to use.
        /// </summary>
        public int Port { get; set; }
        /// <summary>
        /// Gets or sets the midi program to use. 
        /// </summary>
        public int Program { get; set; }
        /// <summary>
        /// Gets or sets the primary channel for all normal midi events. 
        /// </summary>
        public int PrimaryChannel { get; set; }
        /// <summary>
        /// Gets or sets the secondary channel for special midi events. 
        /// </summary>
        public int SecondaryChannel { get; set; }

        /// <summary>
        /// Gets or sets whether the track is muted.
        /// </summary>
        public bool IsMute { get; set; }

        /// <summary>
        /// Gets or sets whether the track is playing alone. 
        /// </summary>
        public bool IsSolo { get; set; }

        /// <summary>
        /// Initializes a new instance of the <see cref="PlaybackInformation"/> class.
        /// </summary>
        public PlaybackInformation()
        {
            Volume = 15;
            Balance = 8;
            Port = 1;
        }

        internal static void CopyTo(PlaybackInformation src, PlaybackInformation dst)
        {
            dst.Volume = src.Volume;
            dst.Balance = src.Balance;
            dst.Port = src.Port;
            dst.Program = src.Program;
            dst.PrimaryChannel = src.PrimaryChannel;
            dst.SecondaryChannel = src.SecondaryChannel;
            dst.IsMute = src.IsMute;
            dst.IsSolo = src.IsSolo;
        }
    }
}