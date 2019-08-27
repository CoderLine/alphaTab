using AlphaTab.Audio.Synth.Midi.Event;

namespace AlphaTab.Audio.Synth.Synthesis
{
    internal class SynthEvent
    {
        public int EventIndex { get; set; }
        public MidiEvent Event { get; set; }
        public bool IsMetronome { get; set; }
        public double Time { get; set; }

        public SynthEvent(int eventIndex, MidiEvent e)
        {
            EventIndex = eventIndex;
            Event = e;
        }

        public static SynthEvent NewMetronomeEvent(int eventIndex, int metronomeLength)
        {
            var x = new SynthEvent(eventIndex, null);
            x.IsMetronome = true;
            return x;
        }
    }
}
