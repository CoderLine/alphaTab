/*
 * This file is part of alphaSynth.
 * Copyright (c) 2014, T3866, PerryCodes, Daniel Kuschny and Contributors, All rights reserved.
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

using AlphaTab.Audio.Synth.Midi.Event;
using AlphaTab.Collections;
using AlphaTab.IO;

namespace AlphaTab.Audio.Synth.Midi
{
    public class MidiFile
    {
        public int Division { get; set; }
        public MidiTrackFormat TrackFormat { get; set; }
        public MidiTimeFormat TimingStandard { get; set; }
        public FastList<MidiEvent> Events { get; private set; }

        public MidiFile()
        {
            Division = MidiUtils.QuarterTime;
            TrackFormat = MidiTrackFormat.SingleTrack;
            TimingStandard = MidiTimeFormat.TicksPerBeat;
            Events = new FastList<MidiEvent>();
        }

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

        public byte[] ToBinary()
        {
            var data = ByteBuffer.Empty();
            WriteTo(data);
            return data.ToArray();
        }

        public void WriteTo(IWriteable s)
        {
            // magic number "MThd" (0x4D546864)
            var b = new byte[] { 0x4D, 0x54, 0x68, 0x64 };
            s.Write(b, 0, b.Length);

            // Header Length 6 (0x00000006)
            b = new byte[] { 0x00, 0x00, 0x00, 0x06 };
            s.Write(b, 0, b.Length);

            // format 
            b = new byte[] { 0x00, 0x00 };
            s.Write(b, 0, b.Length);

            // number of tracks
            short v = 1;
            b = new[] { (byte)((v >> 8) & 0xFF), (byte)(v & 0xFF) };
            s.Write(b, 0, b.Length);

            v = MidiUtils.QuarterTime;
            b = new[] { (byte)((v >> 8) & 0xFF), (byte)(v & 0xFF) };
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
            b = new byte[] { 0x4D, 0x54, 0x72, 0x6B };
            s.Write(b, 0, b.Length);

            // size as integer
            var data = trackData.ToArray();
            var l = data.Length;
            b = new[]{
                (byte)((l >> 24) & 0xFF), (byte)((l >> 16) & 0xFF),
                (byte)((l >> 8) & 0xFF), (byte)((l >> 0) & 0xFF)
            };
            s.Write(b, 0, b.Length);
            s.Write(data, 0, data.Length);
        }

        public static void WriteVariableInt(IWriteable s, int value)
        {
            var array = new byte[4];

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
                    s.WriteByte((byte)(array[n] | 0x80));
                else
                    s.WriteByte(array[n]);
            }
        }
    }

    public enum MidiTrackFormat
    {
        SingleTrack = 0,
        MultiTrack = 1,
        MultiSong = 2
    }

    public enum MidiTimeFormat
    {
        TicksPerBeat = 0,
        FramesPerSecond = 1
    }
}
