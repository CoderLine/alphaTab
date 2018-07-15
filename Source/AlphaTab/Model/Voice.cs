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

using System;
using AlphaTab.Audio;
using AlphaTab.Collections;

namespace AlphaTab.Model
{
    /// <summary>
    /// A voice represents a group of beats 
    /// that can be played during a bar. 
    /// </summary>
    public class Voice
    {
        private FastDictionary<int, Beat> _beatLookup;
        public int Index { get; set; }
        public Bar Bar { get; set; }
        public FastList<Beat> Beats { get; set; }

        public bool IsEmpty
        {
            get; set;

        }

        public Voice()
        {
            Beats = new FastList<Beat>();
            IsEmpty = true;
        }

        public static void CopyTo(Voice src, Voice dst)
        {
            dst.Index = src.Index;
            dst.IsEmpty = src.IsEmpty;
        }

        public void InsertBeat(Beat after, Beat newBeat)
        {
            newBeat.NextBeat = after.NextBeat;
            if (newBeat.NextBeat != null)
            {
                newBeat.NextBeat.PreviousBeat = newBeat;
            }
            newBeat.PreviousBeat = after;
            newBeat.Voice = this;
            after.NextBeat = newBeat;
            Beats.InsertAt(after.Index + 1, newBeat);
        }


        public void AddBeat(Beat beat)
        {
            beat.Voice = this;
            beat.Index = Beats.Count;
            Beats.Add(beat);
            if (!beat.IsEmpty)
            {
                IsEmpty = false;
            }
        }

        private void Chain(Beat beat)
        {
            if (Bar == null) return;

            if (beat.Index < Beats.Count - 1)
            {
                beat.NextBeat = Beats[beat.Index + 1];
                beat.NextBeat.PreviousBeat = beat;
            }
            else if (beat.IsLastOfVoice && beat.Voice.Bar.NextBar != null)
            {
                var nextVoice = Bar.NextBar.Voices[Index];
                if (nextVoice.Beats.Count > 0)
                {
                    beat.NextBeat = nextVoice.Beats[0];
                    beat.NextBeat.PreviousBeat = beat;
                }
                else
                {
                    beat.NextBeat.PreviousBeat = beat;
                }
            }
        }

        public void AddGraceBeat(Beat beat)
        {
            if (Beats.Count == 0)
            {
                AddBeat(beat);
                return;
            }

            // remove last beat
            var lastBeat = Beats[Beats.Count - 1];
            Beats.RemoveAt(Beats.Count - 1);

            // insert grace beat
            AddBeat(beat);
            // reinsert last beat
            AddBeat(lastBeat);

            IsEmpty = false;
        }



        public Beat GetBeatAtDisplayStart(int displayStart)
        {
            if (_beatLookup.ContainsKey(displayStart))
            {
                return _beatLookup[displayStart];
            }

            return null;
        }

        public void Finish(Settings settings)
        {
            _beatLookup = new FastDictionary<int, Beat>();
            for (var index = 0; index < Beats.Count; index++)
            {
                var beat = Beats[index];
                beat.Index = index;
                Chain(beat);
            }

            var currentDisplayTick = 0;
            var currentPlaybackTick = 0;
            for (var i = 0; i < Beats.Count; i++)
            {
                var beat = Beats[i];
                beat.Index = i;
                beat.Finish(settings);

                if (beat.GraceType == GraceType.None)
                {
                    beat.DisplayStart = currentDisplayTick;
                    beat.PlaybackStart = currentPlaybackTick;
                    currentDisplayTick += beat.DisplayDuration;
                    currentPlaybackTick += beat.PlaybackDuration;
                }
                else
                {
                    // find note which is not a grace note
                    Beat nonGrace = beat;
                    int numberOfGraceBeats = 0;
                    while (nonGrace != null && nonGrace.GraceType != GraceType.None)
                    {
                        nonGrace = nonGrace.NextBeat;
                        numberOfGraceBeats++;
                    }

                    var graceDuration = Duration.Eighth;
                    if (numberOfGraceBeats == 1)
                    {
                        graceDuration = Duration.Eighth;
                    }
                    else if (numberOfGraceBeats == 2)
                    {
                        graceDuration = Duration.Sixteenth;
                    }
                    else
                    {
                        graceDuration = Duration.ThirtySecond;
                    }


                    // grace beats have 1/4 size of the non grace beat following them
                    var perGraceDuration = nonGrace == null ? Duration.ThirtySecond.ToTicks() : (nonGrace.DisplayDuration / 4) / numberOfGraceBeats;

                    // move all grace beats 
                    for (int j = 0; j < numberOfGraceBeats; j++)
                    {
                        var graceBeat = Beats[j + i];
                        if (beat.PreviousBeat == null || beat.PreviousBeat.GraceType == GraceType.None)
                        {
                            graceBeat.Duration = graceDuration;
                            graceBeat.UpdateDurations();
                        }
                        graceBeat.DisplayStart = currentDisplayTick - (numberOfGraceBeats - j + 1) * perGraceDuration;
                        graceBeat.DisplayDuration = perGraceDuration;
                    }

                    beat.PlaybackStart = currentPlaybackTick;
                    switch (beat.GraceType)
                    {
                        case GraceType.BeforeBeat:
                            beat.PlaybackStart -= beat.PlaybackDuration;
                            break;
                        case GraceType.OnBeat:
                        case GraceType.BendGrace:
                            currentPlaybackTick += beat.PlaybackDuration;
                            break;
                    }
                }

                _beatLookup[beat.DisplayStart] = beat;
            }
        }
    }
}
