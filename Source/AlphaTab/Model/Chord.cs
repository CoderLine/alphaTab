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
    /// A chord definition.
    /// </summary>
    public class Chord
    {
        public string Name { get; set; }

        /// <summary>
        /// Indicates the first fret of the chord diagram.
        /// </summary>
        public int FirstFret { get; set; }

        /// <summary>
        /// Gets or sets the frets played on the individual strings for this chord. 
        /// - The order in this list goes from the highest string to the lowest string.  
        /// - -1 indicates that the string is not played. 
        /// </summary>
        public FastList<int> Strings { get; set; }

        /// <summary>
        /// Gets or sets a list of frets where the finger should hold a barre 
        /// </summary>
        public FastList<int> BarreFrets { get; set; }

        public Chord()
        {
            Strings = new FastList<int>();
            BarreFrets = new FastList<int>();
        }

        public static void CopyTo(Chord src, Chord dst)
        {
            dst.FirstFret = src.FirstFret;
            dst.Name = src.Name;
            dst.Strings = src.Strings.Clone();
        }
    }
}