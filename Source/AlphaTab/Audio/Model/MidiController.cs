/*
 * This file is part of alphaTab.
 * Copyright (c) 2014, Daniel Kuschny and Contributors, All rights reserved.
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
namespace AlphaTab.Audio.Model
{
    /// <summary>
    /// Contains all midi controller definitions
    /// </summary>
    public enum MidiController : byte
    {
        AllNotesOff = 0x7b,
        Balance = 0x0A,
        Chorus = 0x5d,
        DataEntryLsb = 0x26,
        DataEntryMsb = 0x06,
        Expression = 0x0B,
        Phaser = 0x5f,
        Reverb = 0x5b,
        RpnLsb = 0x64,
        RpnMsb = 0x65,
        Tremolo = 0x5c,
        Volume = 0x07
    }
}
