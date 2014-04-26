using System.Runtime.CompilerServices;
using AlphaTab.Collections;
using AlphaTab.IO;

namespace AlphaTab.Audio.Model
{
    /// <summary>
    /// A midi file consists of multiple tracks including a
    /// info track for multi-track messages and a track for metronome ticks. 
    /// </summary>
    public class MidiFile
    {
        [IntrinsicProperty]
        public FastList<MidiTrack> Tracks { get; set; }

        /// <summary>
        /// Gets or sets the index of the track used for midi events
        /// affecting all tracks. (like the tempo)
        /// </summary>
        [IntrinsicProperty]
        public int InfoTrack { get; set; }

        public MidiFile()
        {
            Tracks = new FastList<MidiTrack>();
        }

        public MidiTrack CreateTrack()
        {
            var track = new MidiTrack();
            track.Index = Tracks.Count;
            track.File = this;
            Tracks.Add(track);
            return track;
        }

        public void WriteTo(Stream s)
        {
            ByteArray b;
        
            // magic number "MThd" (0x4D546864)
            b = new ByteArray(0x4D, 0x54, 0x68, 0x64);
            s.Write(b, 0, b.Length);
        
            // Header Length 6 (0x00000006)
            b = new ByteArray(0x00, 0x00, 0x00, 0x06);
            s.Write(b, 0, b.Length);
        
            // format 
            b = new ByteArray(0x00, 0x01);
            s.Write(b, 0, b.Length);

            // number of tracks
            short v = (short) Tracks.Count;
            b = new ByteArray((byte) ((v >> 8) & 0xFF) , (byte) (v & 0xFF));
            s.Write(b, 0, b.Length);

            v = MidiUtils.QuarterTime;
            b = new ByteArray((byte) ((v >> 8) & 0xFF), (byte) (v & 0xFF));
            s.Write(b, 0, b.Length);

            for (int i = 0; i < Tracks.Count; i++)
            {
                Tracks[i].WriteTo(s);
            }
        }
    }
}
