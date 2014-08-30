using AlphaTab.Audio.Model;
using AlphaTab.Collections;
using AlphaTab.IO;
using AlphaTab.Model;
using AlphaTab.Platform;

namespace AlphaTab.Audio.Generator
{
    /// <summary>
    /// This handler is responsible for writing midi events
    /// to a MidiFile object.
    /// </summary>
    public class MidiFileHandler : IMidiFileHandler
    {
        public const int DefaultMetronomeKey = 0x25;
        public const int DefaultDurationDead = 30;
        public const int DefaultDurationPalmMute = 80;

        public const int RestMessage = 0x00;

        private readonly MidiFile _midiFile;
        private int _metronomeTrack;

        public MidiFileHandler(MidiFile midiFile)
        {
            _midiFile = midiFile;
            _metronomeTrack = -1;
        }

        private void AddEvent(int track, int tick, MidiMessage message)
        {
            _midiFile.Tracks[track].AddEvent(new MidiEvent(tick, message));
        }

        private byte MakeCommand(byte command, byte channel)
        {
            return (byte)((command & 0xF0) | (channel & 0x0F));
        }

        private static byte FixValue(byte value)
        {
            if (value > 127) return 127;
            return value;
        }

        public void AddTimeSignature(int tick, int timeSignatureNumerator, int timeSignatureDenominator)
        {
            var denominatorIndex = 0;
            while ((timeSignatureDenominator = (timeSignatureDenominator >> 1)) > 0)
            {
                denominatorIndex++;
            }
            AddEvent(_midiFile.InfoTrack, tick, BuildMetaMessage(0x58, (byte)(timeSignatureNumerator & 0xFF), (byte)(denominatorIndex & 0xFF), 48, 8));
        }

        public void AddRest(int track, int tick, int channel)
        {
            AddEvent(track, tick, BuildSysExMessage(new byte[] { RestMessage }));
        }

        public void AddNote(int track, int start, int length, byte key, DynamicValue dynamicValue, byte channel)
        {
            var velocity = MidiUtils.DynamicToVelocity(dynamicValue);
            AddEvent(track, start,
                new MidiMessage(new ByteArray(MakeCommand(0x90, channel), FixValue(key), FixValue((byte)velocity))));
            AddEvent(track, start + length,
                new MidiMessage(new ByteArray(MakeCommand(0x80, channel), FixValue(key), FixValue((byte)velocity))));
        }

        public void AddControlChange(int track, int tick, byte channel, byte controller, byte value)
        {
            AddEvent(track, tick, new MidiMessage(new ByteArray(MakeCommand(0xB0, channel), FixValue(controller), FixValue(value))));
        }

        public void AddProgramChange(int track, int tick, byte channel, byte program)
        {
            AddEvent(track, tick, new MidiMessage(new ByteArray(MakeCommand(0xC0, channel), FixValue(program))));
        }

        public void AddTempo(int tick, int tempo)
        {
            // bpm -> microsecond per quarter note
            var tempoInUsq = (60000000 / tempo);
            AddEvent(_midiFile.InfoTrack, tick,
                BuildMetaMessage(0x51,
                    new[] { (byte)((tempoInUsq >> 16) & 0xFF), (byte)((tempoInUsq >> 8) & 0xFF), (byte)(tempoInUsq & 0xFF) }));
        }

        public void AddBend(int track, int tick, byte channel, byte value)
        {
            AddEvent(track, tick, new MidiMessage(new ByteArray(MakeCommand(0xE0, channel), 0, FixValue(value))));
        }

        public void AddMetronome(int start, int length)
        {
            if (_metronomeTrack == -1)
            {
                _midiFile.CreateTrack();
                _metronomeTrack = _midiFile.Tracks.Count - 1;
            }
            AddNote(_metronomeTrack, start, length, DefaultMetronomeKey, DynamicValue.F, MidiUtils.PercussionChannel);
        }


        private static MidiMessage BuildMetaMessage(int metaType, params byte[] data)
        {
            var meta = new FastList<byte>();

            meta.Add(0xFF);
            meta.Add((byte)(metaType & 0xFF));

            WriteVarInt(meta, data.Length);

            meta.AddRange(data);

            return new MidiMessage(new ByteArray(meta.ToArray()));
        }

        private static void WriteVarInt(FastList<byte> data, int v)
        {
            var n = 0;
            var array = new ByteArray(4);
            do
            {
                array[n++] = (byte)((v & 0x7F) & 0xFF);
                v >>= 7;
            } while (v > 0);

            while (n > 0)
            {
                n--;
                if (n > 0)
                    data.Add((byte)((array[n] | 0x80) & 0xFF));
                else
                    data.Add(array[n]);
            }
        }

        private static MidiMessage BuildSysExMessage(byte[] data)
        {
            var sysex = new FastList<byte>();

            sysex.Add(0xF0); // status 
            WriteVarInt(sysex, data.Length + 2); // write length of data
            sysex.Add(0x00); // manufacturer id
            sysex.AddRange(data); // data
            sysex.Add(0xF7); // end of data

            return new MidiMessage(new ByteArray(sysex.ToArray()));
        }

    }
}
