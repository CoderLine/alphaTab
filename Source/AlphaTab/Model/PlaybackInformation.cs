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

namespace AlphaTab.Model
{
    /// <summary>
    /// This public class stores the midi specific information of a track needed
    /// for playback.
    /// </summary>
    public class PlaybackInformation
    {
        public int Volume { get; set; }
        public int Balance { get; set; }

        public int Port { get; set; }
        public int Program { get; set; }
        public int PrimaryChannel { get; set; }
        public int SecondaryChannel { get; set; }

        public bool IsMute { get; set; }
        public bool IsSolo { get; set; }

        public PlaybackInformation()
        {
            Volume = 15;
            Balance = 8;
            Port = 1;
        }

        public static void CopyTo(PlaybackInformation src, PlaybackInformation dst)
        {
            dst.Volume = src.Volume;
            dst.Balance = src.Balance;
            dst.Port = src.Port;
            dst.Program = src.Program;
            dst.PrimaryChannel = src.PrimaryChannel;
            dst.SecondaryChannel = src.SecondaryChannel;
            dst.IsMute = src.IsMute;
            dst.IsSolo = src.IsSolo;
        }
    }
}