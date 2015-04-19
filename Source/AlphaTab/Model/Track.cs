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

using AlphaTab.Collections;
using AlphaTab.Platform;
using AlphaTab.Platform.Model;

namespace AlphaTab.Model
{
    /// <summary>
    /// This public class describes a single track or instrument of score
    /// </summary>
    public class Track
    {
        private const int ShortNameMaxLength = 10;

        public int Capo { get; set; }
        public int Index { get; set; }
        public string Name { get; set; }
        public string ShortName { get; set; }
        /// <summary>
        /// Get or set the guitar tuning of the guitar. This tuning also indicates the number of strings shown in the
        /// guitar tablature. Unlike the <see cref="Note.String"/> property this array directly represents
        /// the order of the tracks shown in the tablature. The first item is the most top tablature line. 
        /// </summary>
        public int[] Tuning { get; set; }
        public string TuningName { get; set; }
        public Color Color { get; set; }

        public PlaybackInformation PlaybackInfo { get; set; }
        public bool IsPercussion { get; set; }

        public Score Score { get; set; }
        public FastList<Bar> Bars { get; set; }

        public FastDictionary<string, Chord> Chords { get; set; }

        public Track()
        {
            Name = "";
            ShortName = "";
            Tuning = new int[0];
            Bars = new FastList<Bar>();
            Chords = new FastDictionary<string, Chord>();
            PlaybackInfo = new PlaybackInformation();
            Color = new Color(200, 0, 0);
        }

        public static void CopyTo(Track src, Track dst)
        {
            dst.Capo = src.Capo;
            dst.Index = src.Index;
            dst.ShortName = src.ShortName;
            dst.Tuning = Std.CloneArray(src.Tuning);
            dst.Color.Raw = src.Color.Raw;
            dst.IsPercussion = src.IsPercussion;
        }
        public void AddBar(Bar bar)
        {
            var bars = Bars;
            bar.Track = this;
            bar.Index = Bars.Count;
            if (bars.Count > 0)
            {
                bar.PreviousBar = bars[bars.Count - 1];
                bar.PreviousBar.NextBar = bar;
            }
            bars.Add(bar);
        }

        public void Finish()
        {
            if (string.IsNullOrEmpty(ShortName))
            {
                ShortName = Name;
                if (ShortName.Length > ShortNameMaxLength)
                    ShortName = ShortName.Substring(0, ShortNameMaxLength);
            }

            for (int i = 0, j = Bars.Count; i < j; i++)
            {
                Bars[i].Finish();
            }
        }
    }
}