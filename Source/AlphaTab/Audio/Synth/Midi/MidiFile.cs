using AlphaTab.Audio.Synth.Midi.Event;
using AlphaTab.Collections;
using AlphaTab.IO;

namespace AlphaTab.Audio.Synth.Midi
{
    /// <summary>
    /// Represents a midi file with a single track that can be played via <see cref="AlphaSynth"/>
    /// </summary>
    public class MidiFile
    {
        /// <summary>
        /// Gets or sets the division per quarter notes.
        /// </summary>
        public int Division { get; set; }

        /// <summary>
        /// Gets a list of midi events sorted by time.
        /// </summary>
        public FastList<MidiEvent> Events { get; }

        /// <summary>
        /// Initializes a new instance of the <see cref="MidiFile"/> class.
        /// </summary>
        public MidiFile()
        {
            Division = MidiUtils.QuarterTime;
            Events = new FastList<MidiEvent>();
        }

        /// <summary>
        /// Adds the given midi event a the correct time position into the file.
        /// </summary>
        /// <param name="e"></param>
        public void AddEvent(MidiEvent e)
        {
            if (Events.Count == 0)
            {
                Events.Add(e);
            }
            else
            {
                var insertPos = Events.Count;
                while (insertPos > 0)
                {
                    var prevItem = Events[insertPos - 1];
                    if (prevItem.Tick > e.Tick)
                    {
                        insertPos--;
                    }
                    else
                    {
                        break;
                    }
                }

                Events.InsertAt(insertPos, e);
            }
        }

        /// <summary>
        /// Writes the midi file into a binary format.
        /// </summary>
        /// <returns>The binary midi file.</returns>
        // ReSharper disable once UnusedMember.Global
        public byte[] ToBinary()
        {
            var data = ByteBuffer.Empty();
            WriteTo(data);
            return data.ToArray();
        }

        /// <summary>
        /// Writes the midi file as binary into the given stream.
        /// </summary>
        /// <returns>The stream to write to.</returns>
        public void WriteTo(IWriteable s)
        {
            // magic number "MThd" (0x4D546864)
            var b = new byte[]
            {
                0x4D, 0x54, 0x68, 0x64
            };
            s.Write(b, 0, b.Length);

            // Header Length 6 (0x00000006)
            b = new byte[]
            {
                0x00, 0x00, 0x00, 0x06
            };
            s.Write(b, 0, b.Length);

            // format
            b = new byte[]
            {
                0x00, 0x00
            };
            s.Write(b, 0, b.Length);

            // number of tracks
            short v = 1;
            b = new[]
            {
                (byte)((v >> 8) & 0xFF), (byte)(v & 0xFF)
            };
            s.Write(b, 0, b.Length);

            v = MidiUtils.QuarterTime;
            b = new[]
            {
                (byte)((v >> 8) & 0xFF), (byte)(v & 0xFF)
            };
            s.Write(b, 0, b.Length);

            // build track data first
            var trackData = ByteBuffer.Empty();
            var previousTick = 0;
            foreach (var midiEvent in Events)
            {
                var delta = midiEvent.Tick - previousTick;
                WriteVariableInt(trackData, delta);
                midiEvent.WriteTo(trackData);
                previousTick = midiEvent.Tick;
            }

            // end of track

            // magic number "MTrk" (0x4D54726B)
            b = new byte[]
            {
                0x4D, 0x54, 0x72, 0x6B
            };
            s.Write(b, 0, b.Length);

            // size as integer
            var data = trackData.ToArray();
            var l = data.Length;
            b = new[]
            {
                (byte)((l >> 24) & 0xFF), (byte)((l >> 16) & 0xFF), (byte)((l >> 8) & 0xFF), (byte)(l & 0xFF)
            };
            s.Write(b, 0, b.Length);
            s.Write(data, 0, data.Length);
        }

        internal static void WriteVariableInt(IWriteable s, int value)
        {
            var array = new byte[4];

            var n = 0;
            do
            {
                array[n++] = (byte)(value & 0x7F & 0xFF);
                value >>= 7;
            } while (value > 0);

            while (n > 0)
            {
                n--;
                if (n > 0)
                {
                    s.WriteByte((byte)(array[n] | 0x80));
                }
                else
                {
                    s.WriteByte(array[n]);
                }
            }
        }
    }
}
