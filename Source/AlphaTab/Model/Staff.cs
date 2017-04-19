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

namespace AlphaTab.Model
{
    /// <summary>
    /// This class describes a single staff within a track. There are instruments like pianos
    /// where a single track can contain multiple staffs. 
    /// </summary>
    public class Staff
    {
        public FastList<Bar> Bars { get; set; }
        public Track Track { get; set; }
        public int Index { get; set; }

        public Staff()
        {
            Bars = new FastList<Bar>();
        }

        public void Finish()
        {
            for (int i = 0, j = Bars.Count; i < j; i++)
            {
                Bars[i].Finish();
            }
        }
    }
}