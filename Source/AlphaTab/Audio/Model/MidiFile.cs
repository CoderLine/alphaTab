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

using AlphaTab.Collections;
using AlphaTab.IO;

namespace AlphaTab.Audio.Model
{
    /// <summary>
    /// A midi file consists of multiple tracks including a
    /// info track for multi-track messages 
    /// </summary>
    public class MidiFile
    {
        public MidiTickLookup TickLookup { get; set; }
        public FastList<MidiTrack> Tracks { get; set; }

        /// <summary>
        /// Gets or sets the index of the track used for midi events
        /// affecting all tracks. (like the tempo)
        /// </summary>
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

        public void WriteTo(IWriteable s)
        {
            // magic number "MThd" (0x4D546864)
            var b = new byte[] { 0x4D, 0x54, 0x68, 0x64 };
            s.Write(b, 0, b.Length);

            // Header Length 6 (0x00000006)
            b = new byte[] { 0x00, 0x00, 0x00, 0x06 };
            s.Write(b, 0, b.Length);

            // format 
            b = new byte[] { 0x00, 0x01 };
            s.Write(b, 0, b.Length);

            // number of tracks
            short v = (short)Tracks.Count;
            b = new [] { (byte)((v >> 8) & 0xFF), (byte)(v & 0xFF) };
            s.Write(b, 0, b.Length);

            v = MidiUtils.QuarterTime;
            b = new [] { (byte)((v >> 8) & 0xFF), (byte)(v & 0xFF) };
            s.Write(b, 0, b.Length);

            for (int i = 0, j = Tracks.Count; i < j; i++)
            {
                Tracks[i].WriteTo(s);
            }
        }
    }
}
