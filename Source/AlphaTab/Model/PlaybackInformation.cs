using System.Runtime.CompilerServices;

namespace AlphaTab.Model
{
    /// <summary>
    /// This public class stores the midi specific information of a track needed
    /// for playback.
    /// </summary>
    public class PlaybackInformation
    {
        [IntrinsicProperty]
        public int Volume { get; set; }
        [IntrinsicProperty]
        public int Balance { get; set; }

        [IntrinsicProperty]
        public int Port { get; set; }
        [IntrinsicProperty]
        public int Program { get; set; }
        [IntrinsicProperty]
        public int PrimaryChannel { get; set; }
        [IntrinsicProperty]
        public int SecondaryChannel { get; set; }

        [IntrinsicProperty]
        public bool IsMute { get; set; }
        [IntrinsicProperty]
        public bool IsSolo { get; set; }

        public PlaybackInformation()
        {
            Volume = 15;
            Balance = 8;
            Port = 1;
        }
    }
}