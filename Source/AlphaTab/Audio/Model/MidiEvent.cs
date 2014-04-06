using AlphaTab.IO;

namespace AlphaTab.Audio.Model
{
    /// <summary>
    /// A midi event is a timed midi message. 
    /// </summary>
    public class MidiEvent
    {
        public MidiTrack Track { get; set; }
        public int Tick { get; set; }
        public MidiMessage Message { get; set; }
        public MidiEvent NextEvent { get; set; }
        public MidiEvent PreviousEvent { get; set; }

        public int DeltaTicks
        {
            get
            {
                return PreviousEvent == null ? 0 : Tick - PreviousEvent.Tick;
            }
        }

        public MidiEvent(int tick, MidiMessage message)
        {
            Tick = tick;
            Message = message;
        }

        public void WriteTo(Stream s)
        {
            WriteVariableInt(s, DeltaTicks);
            Message.WriteTo(s);
        }

        private void WriteVariableInt(Stream s, int value)
        {
            var array = new ByteArray(4);

            var n = 0;
            do
            {
                array[n++] = (byte)((value & 0x7F) & 0xFF);
                value >>= 7;
            } while (value > 0);

            while (n > 0)
            {
                n--;
                if (n > 0)
                    s.WriteByte((byte) (array[n] | 0x80));
                else
                    s.WriteByte(array[n]);
            }
        }
    }
}
