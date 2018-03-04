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
using System;
using AlphaTab.Audio.Synth.IO;
using AlphaTab.Audio.Synth.Util;
using AlphaTab.IO;
using AlphaTab.Platform;

namespace AlphaTab.Audio.Synth.Sf2.Chunks
{
    public class InstrumentChunk : Chunk
    {
        private RawInstrument[] _rawInstruments;

        public InstrumentChunk(string id, int size, IReadable input)
            : base(id, size)
        {
            if (size % 22 != 0)
                throw new Exception("Invalid SoundFont. The preset chunk was invalid.");
            _rawInstruments = new RawInstrument[((int)(size / 22.0))];
            RawInstrument lastInstrument = null;
            for (int x = 0; x < _rawInstruments.Length; x++)
            {
                var i = new RawInstrument();
                i.Name = input.Read8BitStringLength(20);
                i.StartInstrumentZoneIndex = input.ReadUInt16LE();
                if (lastInstrument != null)
                {
                    lastInstrument.EndInstrumentZoneIndex = Platform.Platform.ToUInt16((i.StartInstrumentZoneIndex - 1));
                }
                _rawInstruments[x] = i;
                lastInstrument = i;
            }
        }

        public Instrument[] ToInstruments(Zone[] zones)
        {
            var inst = new Instrument[_rawInstruments.Length - 1];
            for (int x = 0; x < inst.Length; x++)
            {
                var rawInst = _rawInstruments[x];
                var i = new Instrument();
                i.Name = rawInst.Name;
                i.Zones = new Zone[rawInst.EndInstrumentZoneIndex - rawInst.StartInstrumentZoneIndex + 1];
                Platform.Platform.ArrayCopy(zones, rawInst.StartInstrumentZoneIndex, i.Zones, 0, i.Zones.Length);
                inst[x] = i;
            }
            return inst;
        }
    }

    public class RawInstrument
    {
        public string Name { get; set; }
        public int StartInstrumentZoneIndex { get; set; }
        public int EndInstrumentZoneIndex { get; set; }
    }
}
