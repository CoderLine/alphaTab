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

namespace AlphaTab.Importer
{
    /// <summary>
    /// A mixtablechange describes several track changes. 
    /// </summary>
    public class MixTableChange
    {
        public int Volume { get; set; }
        public int Balance { get; set; }
        public int Instrument { get; set; }
        public string TempoName { get; set; }
        public int Tempo { get; set; }
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
