namespace AlphaTab.Importer
{
    /// <summary>
    /// A mixtablechange describes several track changes. 
    /// </summary>
    class MixTableChange
    {
        public int Volume { get; set; }
        public int Balance { get; set; }
        public int Instrument { get; set; }
        public string TempoName { get; set; }
        public int Tempo { get; set; }
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
