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
using System.Runtime.CompilerServices;

namespace AlphaTab.Importer
{
    /// <summary>
    /// A mixtablechange describes several track changes. 
    /// </summary>
    public class MixTableChange
    {
        [IntrinsicProperty]
        public int Volume { get; set; }
        [IntrinsicProperty]
        public int Balance { get; set; }
        [IntrinsicProperty]
        public int Instrument { get; set; }
        [IntrinsicProperty]
        public string TempoName { get; set; }
        [IntrinsicProperty]
        public int Tempo { get; set; }
        [IntrinsicProperty]
        public int Duration { get; set; }
    
        public MixTableChange()
        {
            Volume = -1;
            Balance = -1;
            Instrument = -1;
            TempoName = null;
            Tempo = -1;
            Duration = 0;
        }
    }
}
