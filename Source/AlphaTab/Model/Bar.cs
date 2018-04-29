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

namespace AlphaTab.Model
{
    /// <summary>
    /// Lists all simile mark types as they are assigned to bars. 
    /// </summary>
    public enum SimileMark
    {
        /// <summary>
        /// No simile mark is applied
        /// </summary>
        None,
        /// <summary>
        /// A simple simile mark. The previous bar is repeated. 
        /// </summary>
        Simple,
        /// <summary>
        /// A double simile mark. This value is assigned to the first
        /// bar of the 2 repeat bars. 
        /// </summary>
        FirstOfDouble,
        /// <summary>
        /// A double simile mark. This value is assigned to the second
        /// bar of the 2 repeat bars. 
        /// </summary>
        SecondOfDouble
    }

    /// <summary>
    /// A bar is a single block within a track, also known as Measure.
    /// </summary>
    public class Bar
    {
        /// <summary>
        /// This is a global counter for all beats. We use it 
        /// at several locations for lookup tables. 
        /// </summary>
        private static int GlobalBarId = 0;

        public int Id { get; set; }
        public int Index { get; set; }

        public Bar NextBar { get; set; }
        public Bar PreviousBar { get; set; }
        public Clef Clef { get; set; }
        public Ottavia ClefOttava { get; set; }
        public Staff Staff { get; set; }
        public FastList<Voice> Voices { get; set; }

        public SimileMark SimileMark { get; set; }

        public Bar()
        {
            Id = GlobalBarId++;
            Voices = new FastList<Voice>();
            Clef = Clef.G2;
            ClefOttava = Ottavia.Regular;
            SimileMark = SimileMark.None;
        }

        public static void CopyTo(Bar src, Bar dst)
        {
            dst.Id = src.Id;
            dst.Index = src.Index;
            dst.Clef = src.Clef;
            dst.ClefOttava = src.ClefOttava;
            dst.SimileMark = src.SimileMark;
        }

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
                return Staff.Track.Score.MasterBars[Index];
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
            }
        }
    }
}