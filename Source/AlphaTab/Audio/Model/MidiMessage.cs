using System.Runtime.CompilerServices;
using AlphaTab.IO;

namespace AlphaTab.Audio.Model
{
    /// <summary>
    /// Represents a midi message. 
    /// </summary>
    public class MidiMessage
    {
        [IntrinsicProperty]
        public MidiEvent Event { get; set; }

        /// <summary>
        /// The raw midi message data
        /// </summary>
        [IntrinsicProperty]
        public ByteArray Data { get; set; }

        public MidiMessage(ByteArray data)
        {
            Data = data;
        }

        public void WriteTo(IWriteable s)
        {
            s.Write(Data, 0, Data.Length);
        }
    }
}
