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
using AlphaTab.Collections;

namespace AlphaTab.Model
{
    /// <summary>
    /// A bar is a single block within a track, also known as Measure.
    /// </summary>
    public class Bar
    {
        public Bar()
        {
            Voices = new FastList<Voice>();
            Clef = Clef.G2;
        }

        [IntrinsicProperty]
        public int Index { get; set; }
        [IntrinsicProperty]
        public Bar NextBar { get; set; }
        [IntrinsicProperty]
        public Bar PreviousBar { get; set; }
        [IntrinsicProperty]
        public Clef Clef { get; set; }
        [IntrinsicProperty]
        public Track Track { get; set; }
        [IntrinsicProperty]
        public FastList<Voice> Voices { get; set; }
        [IntrinsicProperty]
        public Duration? MinDuration { get; set; }
        [IntrinsicProperty]
        public Duration? MaxDuration { get; set; }

        public void AddVoice(Voice voice)
        {
            voice.Bar = this;
            voice.Index = Voices.Count;
            Voices.Add(voice);
        }

        public MasterBar MasterBar
        {
            get
            {
                return Track.Score.MasterBars[Index];
            }
        }


        public bool IsEmpty
        {
            get
            {
                for (int i = 0, j = Voices.Count; i < j; i++)
                {
                    if (!Voices[i].IsEmpty)
                    {
                        return false;
                    }
                }
                return true;
            }
        }


        public void Finish()
        {
            for (int i = 0, j = Voices.Count; i < j; i++)
            {
                var voice = Voices[i];
                voice.Finish();
                if (voice.MinDuration == null || MinDuration == null || MinDuration.Value > voice.MinDuration.Value)
                {
                    MinDuration = voice.MinDuration;
                }
                if (voice.MaxDuration == null || MaxDuration == null || MaxDuration.Value > voice.MaxDuration.Value)
                {
                    MinDuration = voice.MaxDuration;
                }
            }
        }
    }
}