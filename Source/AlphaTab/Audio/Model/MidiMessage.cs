using System.IO;

namespace AlphaTab.Audio.Model
{
    /// <summary>
    /// Represents a midi message. 
    /// </summary>
    public class MidiMessage
    {
        public MidiEvent Event { get; set; }

        /// <summary>
        /// The raw midi message data
        /// </summary>
        public byte[] Data { get; set; }

        public MidiMessage(byte[] data)
        {
            Data = data;
        }

        public void WriteTo(Stream s)
        {
            s.Write(Data, 0, Data.Length);
        }
    }
}
