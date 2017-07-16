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
using AlphaTab.Model;

namespace AlphaTab.Audio.Generator
{
    /// <summary>
    /// A handler is responsible for writing midi events to a custom structure
    /// </summary>
    public interface IMidiFileHandler
    {
        void AddTimeSignature(int tick, int timeSignatureNumerator, int timeSignatureDenominator);
        void AddRest(int track, int tick, int channel);
        void AddNote(int track, int start, int length, byte key, DynamicValue dynamicValue, byte channel);
        void AddControlChange(int track, int tick, byte channel, byte controller, byte value);
        void AddProgramChange(int track, int tick, byte channel, byte program);
        void AddTempo(int tick, int tempo);
        void AddBend(int track, int tick, byte channel, byte value);
        void FinishTrack(int track, int tick);
    }
}
