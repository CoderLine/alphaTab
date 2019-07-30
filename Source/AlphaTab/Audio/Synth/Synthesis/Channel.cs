namespace AlphaTab.Audio.Synth.Synthesis
{
    internal class Channel
    {
        public ushort PresetIndex { get; set; }
        public ushort Bank { get; set; }
        public ushort PitchWheel { get; set; }
        public ushort MidiPan { get; set; }
        public ushort MidiVolume { get; set; }
        public ushort MidiExpression { get; set; }
        public ushort MidiRpn { get; set; }
        public ushort MidiData { get; set; }
        public float PanOffset { get; set; }
        public float GainDb { get; set; }
        public float PitchRange { get; set; }
        public float Tuning { get; set; }

        public float MixVolume { get; set; }
        public bool Mute { get; set; }
        public bool Solo { get; set; }
    }
}
