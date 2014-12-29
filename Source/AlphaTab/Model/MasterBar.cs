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

using AlphaTab.Audio;

namespace AlphaTab.Model
{
    /// <summary>
    /// The MasterBar stores information about a bar which affects
    /// all tracks.
    /// </summary>
    public class MasterBar
    {
        /// <summary>
        /// The maximum alternate endings.  (1 byte with 8 bitflags)
        /// </summary>
        public const int MaxAlternateEndings = 8;

        public byte AlternateEndings { get; set; }
        public MasterBar NextMasterBar { get; set; }
        public MasterBar PreviousMasterBar { get; set; }
        public int Index { get; set; }
        public int KeySignature { get; set; }
        public bool IsDoubleBar { get; set; }

        public bool IsRepeatStart { get; set; }
        public bool IsRepeatEnd { get { return RepeatCount > 0; } }
        public int RepeatCount { get; set; }
        public RepeatGroup RepeatGroup { get; set; }

        public int TimeSignatureNumerator { get; set; }
        public int TimeSignatureDenominator { get; set; }

        public TripletFeel TripletFeel { get; set; }

        public Section Section { get; set; }
        public bool IsSectionStart { get { return Section != null; } }

        public Automation TempoAutomation { get; set; }
        public Automation VolumeAutomation { get; set; }

        public Score Score { get; set; }

        /// <summary>
        /// The timeline position of the voice within the whole score. (unit: midi ticks)
        /// </summary>
        public int Start { get; set; }

        public MasterBar()
        {
            TimeSignatureDenominator = 4;
            TimeSignatureNumerator = 4;
            TripletFeel = TripletFeel.NoTripletFeel;
        }

        public static void CopyTo(MasterBar src, MasterBar dst)
        {
            dst.AlternateEndings = src.AlternateEndings;
            dst.Index = src.Index;
            dst.KeySignature = src.KeySignature;
            dst.IsDoubleBar = src.IsDoubleBar;
            dst.IsRepeatStart = src.IsRepeatStart;
            dst.RepeatCount = src.RepeatCount;
            dst.TimeSignatureNumerator = src.TimeSignatureNumerator;
            dst.TimeSignatureDenominator = src.TimeSignatureDenominator;
            dst.TripletFeel = src.TripletFeel;
            dst.Start = src.Start;
        }
         
        /// <summary>
        /// Calculates the time spent in this bar. (unit: midi ticks)
        /// </summary>
        /// <returns></returns>
        public int CalculateDuration()
        {
            return TimeSignatureNumerator * MidiUtils.ValueToTicks(TimeSignatureDenominator);
        }
    }
}