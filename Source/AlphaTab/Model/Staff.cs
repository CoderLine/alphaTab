/*
 * This file is part of alphaTab.
 * Copyright © 2018, Daniel Kuschny and Contributors, All rights reserved.
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
using AlphaTab.Platform.Model;

namespace AlphaTab.Model
{
    /// <summary>
    /// Represents the different kinds of staffs.
    /// </summary>
    public enum StaffKind
    {
        Tablature,
        Score,
        Percussion,
        Mixed
    }

    /// <summary>
    /// This class describes a single staff within a track. There are instruments like pianos
    /// where a single track can contain multiple staffs. 
    /// </summary>
    public class Staff
    {
        public FastList<Bar> Bars { get; set; }
        public Track Track { get; set; }
        public int Index { get; set; }

        public FastDictionary<string, Chord> Chords { get; set; }
        public int Capo { get; set; }

        /// <summary>
        /// Gets or sets the number of semitones this track should be
        /// transposed. This applies to rendering and playback.
        /// </summary>
        public int TranspositionPitch { get; set; }
        /// <summary>
        /// Gets or sets the number of semitones this track should be 
        /// transposed. This applies only to rendering. 
        /// </summary>
        public int DisplayTranspositionPitch { get; set; }

        /// <summary>
        /// Get or set the guitar tuning of the guitar. This tuning also indicates the number of strings shown in the
        /// guitar tablature. Unlike the <see cref="Note.String"/> property this array directly represents
        /// the order of the tracks shown in the tablature. The first item is the most top tablature line. 
        /// </summary>
        public int[] Tuning { get; set; }
        public string TuningName { get; set; }

        public bool IsStringed { get { return Tuning.Length > 0; } }

        public StaffKind StaffKind { get; set; }

        public Staff()
        {
            Bars = new FastList<Bar>();
            Tuning = new int[0];
            Chords = new FastDictionary<string, Chord>();
            StaffKind = StaffKind.Mixed;
        }

        public static void CopyTo(Staff src, Staff dst)
        {
            dst.Capo = src.Capo;
            dst.Index = src.Index;
            dst.Tuning = Platform.Platform.CloneArray(src.Tuning);
            dst.TranspositionPitch = src.TranspositionPitch;
            dst.DisplayTranspositionPitch = src.DisplayTranspositionPitch;
            dst.StaffKind = src.StaffKind;
        }

        public void Finish()
        {
            for (int i = 0, j = Bars.Count; i < j; i++)
            {
                Bars[i].Finish();
            }
        }

        public void AddBar(Bar bar)
        {
            var bars = Bars;
            bar.Staff = this;
            bar.Index = bars.Count;
            if (bars.Count > 0)
            {
                bar.PreviousBar = bars[bars.Count - 1];
                bar.PreviousBar.NextBar = bar;
            }
            bars.Add(bar);
        }
    }
}