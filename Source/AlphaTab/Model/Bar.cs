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
    /// A bar is a single block within a track, also known as Measure.
    /// </summary>
    public class Bar
    {
        /// <summary>
        /// This is a global counter for all beats. We use it 
        /// at several locations for lookup tables. 
        /// </summary>
        private static int GlobalBarId = 0;

        /// <summary>
        /// Gets or sets the unique id of this bar. 
        /// </summary>
        public int Id { get; set; }
        /// <summary>
        /// Gets or sets the zero-based index of this bar within the staff. 
        /// </summary>
        public int Index { get; set; }

        /// <summary>
        /// Gets or sets the next bar that comes after this bar. 
        /// </summary>
        public Bar NextBar { get; set; }
        /// <summary>
        /// Gets or sets the previous bar that comes before this bar. 
        /// </summary>
        public Bar PreviousBar { get; set; }

        /// <summary>
        /// Gets or sets the clef on this bar. 
        /// </summary>
        public Clef Clef { get; set; }

        /// <summary>
        /// Gets or sets the ottava applied to the clef. 
        /// </summary>
        public Ottavia ClefOttava { get; set; }

        /// <summary>
        /// Gets or sets the reference to the parent staff. 
        /// </summary>
        public Staff Staff { get; set; }

        /// <summary>
        /// Gets or sets the list of voices contained in this bar. 
        /// </summary>
        public FastList<Voice> Voices { get; set; }

        /// <summary>
        /// Gets or sets the simile mark on this bar. 
        /// </summary>
        public SimileMark SimileMark { get; set; }

        /// <summary>
        /// Gets the masterbar for this bar. 
        /// </summary>
        public MasterBar MasterBar => Staff.Track.Score.MasterBars[Index];

        /// <summary>
        /// Gets a value indicating whether all voices in this bar are empty and therefore the whole bar is empty. 
        /// </summary>
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

        /// <summary>
        /// Initializes a new instance of the <see cref="Bar"/> class.
        /// </summary>
        public Bar()
        {
            Id = GlobalBarId++;
            Voices = new FastList<Voice>();
            Clef = Clef.G2;
            ClefOttava = Ottavia.Regular;
            SimileMark = SimileMark.None;
        }

        internal static void CopyTo(Bar src, Bar dst)
        {
            dst.Id = src.Id;
            dst.Index = src.Index;
            dst.Clef = src.Clef;
            dst.ClefOttava = src.ClefOttava;
            dst.SimileMark = src.SimileMark;
        }

        internal void AddVoice(Voice voice)
        {
            voice.Bar = this;
            voice.Index = Voices.Count;
            Voices.Add(voice);
        }

        internal void Finish(Settings settings)
        {
            for (int i = 0, j = Voices.Count; i < j; i++)
            {
                var voice = Voices[i];
                voice.Finish(settings);
            }
        }
    }
}