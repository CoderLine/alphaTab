namespace AlphaTab.Audio.Model
{
    /// <summary>
    /// Contains all midi controller definitions
    /// </summary>
    public enum MidiController : byte
    {
        AllNotesOff = 0x7b,
        Balance = 0x0A,
        Chorus = 0x5d,
        DataEntryLsb = 0x26,
        DataEntryMsb = 0x06,
        Expression = 0x0B,
        Phaser = 0x5f,
        Reverb = 0x5b,
        RpnLsb = 0x64,
        RpnMsb = 0x65,
        Tremolo = 0x5c,
        Volume = 0x07
    }
}
