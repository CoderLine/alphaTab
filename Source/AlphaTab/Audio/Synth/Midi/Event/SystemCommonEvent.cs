namespace AlphaTab.Audio.Synth.Midi.Event
{
    enum SystemCommonTypeEnum
    {
        SystemExclusive = 0xF0,
        MtcQuarterFrame = 0xF1,
        SongPosition = 0xF2,
        SongSelect = 0xF3,
        TuneRequest = 0xF6,
        SystemExclusive2 = 0xF7
    }

    abstract class SystemCommonEvent : MidiEvent
    {
        public override int Channel
        {
            get { return -1; }
        }

        public override MidiEventType Command
        {
            get { return (MidiEventType) (Message & 0x00000FF); }
        }

        protected SystemCommonEvent(int delta, byte status, byte data1, byte data2)
            : base(delta, status, data1, data2)
        {
        }
    }
}
