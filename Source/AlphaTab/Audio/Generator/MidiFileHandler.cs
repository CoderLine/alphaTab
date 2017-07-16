/*
 * This file is part of alphaTab.
 * Copyright © 2017, Daniel Kuschny and Contributors, All rights reserved.
 * 
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3.0 of the License, or at your option any later version.
 * 
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library.
 */
using AlphaTab.Audio.Model;
using AlphaTab.IO;
using AlphaTab.Model;

namespace AlphaTab.Audio.Generator
{
    /// <summary>
    /// This handler is responsible for writing midi events
    /// to a MidiFile object.
    /// </summary>
    public class MidiFileHandler : IMidiFileHandler
    {
        public const int DefaultMetronomeKey = 37;
        public const int DefaultDurationDead = 30;
        public const int DefaultDurationPalmMute = 80;

        public const int RestMessage = 0x00;

        private readonly MidiFile _midiFile;

        public MidiFileHandler(MidiFile midiFile)
        {
            _midiFile = midiFile;
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
            AddEvent(_midiFile.InfoTrack, tick, BuildMetaMessage(0x58, new byte[] { (byte)(timeSignatureNumerator & 0xFF), (byte)(denominatorIndex & 0xFF), 48, 8 }));
        }

        public void AddRest(int track, int tick, int channel)
        {
            AddEvent(track, tick, BuildSysExMessage(new byte[] { RestMessage }));
        }

        public void AddNote(int track, int start, int length, byte key, DynamicValue dynamicValue, byte channel)
        {
            var velocity = MidiUtils.DynamicToVelocity(dynamicValue);
            AddEvent(track, start,
                new MidiMessage(new[] { MakeCommand(0x90, channel), FixValue(key), FixValue((byte)velocity) }));
            AddEvent(track, start + length,
                new MidiMessage(new[] { MakeCommand(0x80, channel), FixValue(key), FixValue((byte)velocity) }));
        }

        public void AddControlChange(int track, int tick, byte channel, byte controller, byte value)
        {
            AddEvent(track, tick, new MidiMessage(new[] { MakeCommand(0xB0, channel), FixValue(controller), FixValue(value) }));
        }

        public void AddProgramChange(int track, int tick, byte channel, byte program)
        {
            AddEvent(track, tick, new MidiMessage(new[] { MakeCommand(0xC0, channel), FixValue(program) }));
        }

        public void AddTempo(int tick, int tempo)
        {
            // bpm -> microsecond per quarter note
            var tempoInUsq = (60000000 / tempo);
            AddEvent(_midiFile.InfoTrack, tick,
                BuildMetaMessage(0x51,
                    new[] { (byte)((tempoInUsq >> 16) & 0xFF), (byte)((tempoInUsq >> 8) & 0xFF), (byte)(tempoInUsq & 0xFF) }));
        }

        public void FinishTrack(int track, int tick)
        {
            AddEvent(_midiFile.InfoTrack, tick, BuildMetaMessage(0x2F, new byte[0]));
        }


        public void AddBend(int track, int tick, byte channel, byte value)
        {
            AddEvent(track, tick, new MidiMessage(new byte[] { MakeCommand(0xE0, channel), 0, FixValue(value) }));
        }

        private static MidiMessage BuildMetaMessage(int metaType, byte[] data)
        {
            var meta = ByteBuffer.Empty();

            meta.WriteByte(0xFF);
            meta.WriteByte((byte)(metaType & 0xFF));

            WriteVarInt(meta, data.Length);

            meta.Write(data, 0, data.Length);

            return new MidiMessage(meta.ToArray());
        }

        private static void WriteVarInt(ByteBuffer data, int v)
        {
            var n = 0;
            var array = new byte[4];
            do
            {
                array[n++] = (byte)((v & 0x7F) & 0xFF);
                v >>= 7;
            } while (v > 0);

            while (n > 0)
            {
                n--;
                if (n > 0)
                    data.WriteByte((byte)((array[n] | 0x80) & 0xFF));
                else
                    data.WriteByte(array[n]);
            }
        }

        private static MidiMessage BuildSysExMessage(byte[] data)
        {
            var sysex = ByteBuffer.Empty();

            sysex.WriteByte(0xF0); // status 
            WriteVarInt(sysex, data.Length + 2); // write length of data
            sysex.WriteByte(0x00); // manufacturer id
            sysex.Write(data, 0, data.Length); // data
            sysex.WriteByte(0xF7); // end of data

            return new MidiMessage(sysex.ToArray());
        }
    }
}
