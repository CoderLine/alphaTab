using AlphaTab.Audio.Synth.Midi;
using AlphaTab.Audio.Synth.Midi.Event;
using AlphaTab.Model;

namespace AlphaTab.Audio.Generator
{
    /// <summary>
    /// This implementation of the <see cref="IMidiFileHandler"/> generates a <see cref="MidiFile"/>
    /// object which can be used in AlphaSynth for playback. 
    /// </summary>
    public class AlphaSynthMidiFileHandler : IMidiFileHandler
    {
        private readonly MidiFile _midiFile;

        /// <summary>
        /// Initializes a new instance of the <see cref="AlphaSynthMidiFileHandler"/> class.
        /// </summary>
        /// <param name="midiFile">The midi file.</param>
        public AlphaSynthMidiFileHandler(MidiFile midiFile)
        {
            _midiFile = midiFile;
        }

        /// <inheritdoc />
        public void AddTimeSignature(int tick, int timeSignatureNumerator, int timeSignatureDenominator)
        {
            var denominatorIndex = 0;
            while ((timeSignatureDenominator = timeSignatureDenominator >> 1) > 0)
            {
                denominatorIndex++;
            }

            var message = new MetaDataEvent(tick,
                0xFF,
                (byte)MetaEventTypeEnum.TimeSignature,
                new byte[]
                {
                    (byte)(timeSignatureNumerator & 0xFF), (byte)(denominatorIndex & 0xFF), 48, 8
                });
            _midiFile.AddEvent(message);
        }

        /// <inheritdoc />
        public void AddRest(int track, int tick, int channel)
        {
            var message = new SystemExclusiveEvent(tick,
                (byte)SystemCommonTypeEnum.SystemExclusive,
                0,
                new byte[]
                {
                    0xFF
                });
            _midiFile.AddEvent(message);
        }

        /// <inheritdoc />
        public void AddNote(int track, int start, int length, byte key, DynamicValue dynamicValue, byte channel)
        {
            var velocity = MidiUtils.DynamicToVelocity(dynamicValue);

            var noteOn = new MidiEvent(start,
                MakeCommand((byte)MidiEventType.NoteOn, channel),
                FixValue(key),
                FixValue((byte)velocity));
            _midiFile.AddEvent(noteOn);

            var noteOff = new MidiEvent(start + length,
                MakeCommand((byte)MidiEventType.NoteOff, channel),
                FixValue(key),
                FixValue((byte)velocity));
            _midiFile.AddEvent(noteOff);
        }

        private byte MakeCommand(byte command, byte channel)
        {
            return (byte)((command & 0xF0) | (channel & 0x0F));
        }

        private static byte FixValue(int value)
        {
            if (value > 127)
            {
                return 127;
            }

            if (value < 0)
            {
                return 0;
            }

            return (byte)value;
        }

        /// <inheritdoc />
        public void AddControlChange(int track, int tick, byte channel, byte controller, byte value)
        {
            var message = new MidiEvent(tick,
                MakeCommand((byte)MidiEventType.Controller, channel),
                FixValue(controller),
                FixValue(value));
            _midiFile.AddEvent(message);
        }

        /// <inheritdoc />
        public void AddProgramChange(int track, int tick, byte channel, byte program)
        {
            var message = new MidiEvent(tick,
                MakeCommand((byte)MidiEventType.ProgramChange, channel),
                FixValue(program),
                0);
            _midiFile.AddEvent(message);
        }

        /// <inheritdoc />
        public void AddTempo(int tick, int tempo)
        {
            // bpm -> microsecond per quarter note
            var tempoInUsq = 60000000 / tempo;

            var message = new MetaNumberEvent(tick,
                0xFF,
                (byte)MetaEventTypeEnum.Tempo,
                tempoInUsq);
            _midiFile.AddEvent(message);
        }

        /// <inheritdoc />
        public void AddBend(int track, int tick, byte channel, int value)
        {
            var message = new MidiEvent(tick, MakeCommand((byte)MidiEventType.PitchBend, channel), 0, FixValue(value));
            _midiFile.AddEvent(message);
        }

        /// <inheritdoc />
        public void FinishTrack(int track, int tick)
        {
            var message = new MetaDataEvent(tick,
                0xFF,
                (byte)MetaEventTypeEnum.EndOfTrack,
                new byte[0]);
            _midiFile.AddEvent(message);
        }
    }
}
