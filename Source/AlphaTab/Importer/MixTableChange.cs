using System.Runtime.CompilerServices;

namespace AlphaTab.Importer
{
    /// <summary>
    /// A mixtablechange describes several track changes. 
    /// </summary>
    public class MixTableChange
    {
        [IntrinsicProperty]
        public int Volume { get; set; }
        [IntrinsicProperty]
        public int Balance { get; set; }
        [IntrinsicProperty]
        public int Instrument { get; set; }
        [IntrinsicProperty]
        public string TempoName { get; set; }
        [IntrinsicProperty]
        public int Tempo { get; set; }
        [IntrinsicProperty]
        public int Duration { get; set; }
    
        public MixTableChange()
        {
            Volume = -1;
            Balance = -1;
            Instrument = -1;
            TempoName = null;
            Tempo = -1;
            Duration = 0;
        }
    }
}
