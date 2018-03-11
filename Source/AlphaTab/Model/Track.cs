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
    /// This public class describes a single track or instrument of score.
    /// It is bascially a list of staffs containing individual music notation kinds.
    /// </summary>
    public class Track
    {
        private const int ShortNameMaxLength = 10;

        public int Index { get; set; }
        public Score Score { get; set; }
        public FastList<Staff> Staves { get; set; }
        public PlaybackInformation PlaybackInfo { get; set; }
        public Color Color { get; set; }

        public string Name { get; set; }
        public string ShortName { get; set; }

        public Track(int staveCount)
        {
            Staves = new FastList<Staff>();
            EnsureStaveCount(staveCount);
            PlaybackInfo = new PlaybackInformation();
            Name = "";
            ShortName = "";
            Color = new Color(200, 0, 0);
        }

        public void EnsureStaveCount(int staveCount)
        {
            while (Staves.Count < staveCount)
            {
                var staff = new Staff();
                staff.Index = Staves.Count;
                staff.Track = this;
                Staves.Add(staff);
            }
        }

        public static void CopyTo(Track src, Track dst)
        {
            dst.Name = src.Name;
            dst.ShortName = src.ShortName;
            dst.Index = src.Index;
            dst.Color.Raw = src.Color.Raw;
            dst.Color.RGBA = src.Color.RGBA;
        }

        public void Finish()
        {

            if (string.IsNullOrEmpty(ShortName))
            {
                ShortName = Name;
                if (ShortName.Length > ShortNameMaxLength)
                    ShortName = ShortName.Substring(0, ShortNameMaxLength);
            }

            for (int i = 0, j = Staves.Count; i < j; i++)
            {
                Staves[i].Finish();
            }
        }

        public void ApplyLyrics(FastList<Lyrics> lyrics)
        {
            foreach (var lyric in lyrics)
            {
                lyric.Finish();
            }

            var staff = Staves[0];

            for (var li = 0; li < lyrics.Count; li++)
            {
                var lyric = lyrics[li];
                if (lyric.StartBar >= 0)
                {
                    var beat = staff.Bars[lyric.StartBar].Voices[0].Beats[0];
                    for (int ci = 0; ci < lyric.Chunks.Length && beat != null; ci++)
                    {
                        // skip rests and empty beats
                        while (beat != null && (beat.IsEmpty || beat.IsRest))
                        {
                            beat = beat.NextBeat;
                        }

                        // mismatch between chunks and beats might lead to missing beats
                        if (beat != null)
                        {
                            // initialize lyrics list for beat if required
                            if (beat.Lyrics == null)
                            {
                                beat.Lyrics = new string[lyrics.Count];
                            }
                            // assign chunk
                            beat.Lyrics[li] = lyric.Chunks[ci];
                            beat = beat.NextBeat;
                        }
                    }
                }
            }
        }
    }
}