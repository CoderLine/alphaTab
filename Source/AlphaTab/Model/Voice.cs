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

        /// <summary>
        /// Gets or sets the zero-based index of this voice within the bar. 
        /// </summary>
        public int Index { get; set; }
        /// <summary>
        /// Gets or sets the reference to the bar this voice belongs to. 
        /// </summary>
        public Bar Bar { get; set; }

        /// <summary>
        /// Gets or sets the list of beats contained in this voice. 
        /// </summary>
        public FastList<Beat> Beats { get; set; }

        /// <summary>
        /// Gets or sets a value indicating whether this voice is empty. 
        /// </summary>
        public bool IsEmpty
        {
            get; set;
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="Voice"/> class.
        /// </summary>
        public Voice()
        {
            Beats = new FastList<Beat>();
            IsEmpty = true;
        }

        internal static void CopyTo(Voice src, Voice dst)
        {
            dst.Index = src.Index;
            dst.IsEmpty = src.IsEmpty;
        }

        internal void InsertBeat(Beat after, Beat newBeat)
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


        internal void AddBeat(Beat beat)
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

        internal void AddGraceBeat(Beat beat)
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
        
        internal Beat GetBeatAtDisplayStart(int displayStart)
        {
            if (_beatLookup.ContainsKey(displayStart))
            {
                return _beatLookup[displayStart];
            }

            return null;
        }

        internal void Finish(Settings settings)
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

                if (beat.GraceType == GraceType.None || beat.GraceType == GraceType.BendGrace)
                {
                    beat.DisplayStart = currentDisplayTick;
                    beat.PlaybackStart = currentPlaybackTick;
                    currentDisplayTick += beat.DisplayDuration;
                    currentPlaybackTick += beat.PlaybackDuration;
                }
                else
                {
                    if (beat.PreviousBeat == null || beat.PreviousBeat.GraceType == GraceType.None)
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
                        int stolenDuration = 0;
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

                        if (nonGrace != null)
                        {
                            nonGrace.UpdateDurations();
                        }

                        // grace beats have 1/4 size of the non grace beat following them
                        var perGraceDuration = nonGrace == null
                            ? Duration.ThirtySecond.ToTicks()
                            : (nonGrace.DisplayDuration / 4) / numberOfGraceBeats;

                        // move all grace beats 
                        for (int j = 0; j < numberOfGraceBeats; j++)
                        {
                            var graceBeat = Beats[j + i];
                            graceBeat.Duration = graceDuration;
                            graceBeat.UpdateDurations();

                            graceBeat.DisplayStart = currentDisplayTick - (numberOfGraceBeats - j + 1) * perGraceDuration;
                            graceBeat.DisplayDuration = perGraceDuration;

                            stolenDuration += graceBeat.PlaybackDuration;
                        }

                        // steal needed duration from beat duration
                        if (beat.GraceType == GraceType.BeforeBeat)
                        {
                            if (beat.PreviousBeat != null)
                            {
                                beat.PreviousBeat.PlaybackDuration -= stolenDuration;
                            }
                            currentPlaybackTick -= stolenDuration;
                        }
                        else if (nonGrace != null && beat.GraceType == GraceType.OnBeat)
                        {
                            nonGrace.PlaybackDuration -= stolenDuration;
                        }
                    }

                    beat.PlaybackStart = currentPlaybackTick;
                    currentPlaybackTick = beat.PlaybackStart + beat.PlaybackDuration;
                }

                _beatLookup[beat.DisplayStart] = beat;
            }
        }
    }
}
