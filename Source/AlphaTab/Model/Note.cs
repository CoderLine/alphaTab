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
using AlphaTab.Rendering.Utils;

namespace AlphaTab.Model
{
    /// <summary>
    /// Lists the modes how accidentals are handled for notes
    /// </summary>
    public enum NoteAccidentalMode
    {
        /// <summary>
        /// Accidentals are calculated automatically. 
        /// </summary>
        Default,
        /// <summary>
        /// If the default behavior calculates a Sharp, use flat instead (and vice versa).
        /// </summary>
        SwapAccidentals,
        /// <summary>
        /// This will move the note one line down and applies a Naturalize. 
        /// </summary>
        ForceNatural,
        /// <summary>
        /// This will move the note one line down and applies a Sharp. 
        /// </summary>
        ForceSharp,
        /// <summary>
        /// This will move the note one line up and applies a Flat. 
        /// </summary>
        ForceFlat,
    }


    /// <summary>
    /// A note is a single played sound on a fretted instrument. 
    /// It consists of a fret offset and a string on which the note is played on.
    /// It also can be modified by a lot of different effects.  
    /// </summary>
    public class Note
    {
        /// <summary>
        /// This is a global counter for all notes. We use it 
        /// at several locations for lookup tables. 
        /// </summary>
        private static int GlobalNoteId = 0;


        public int Id { get; set; }
        public int Index { get; set; }
        public AccentuationType Accentuated { get; set; }
        public FastList<BendPoint> BendPoints { get; set; }
        public BendPoint MaxBendPoint { get; set; }
        public bool HasBend { get { return BendPoints.Count > 0; } }

        #region Stringed Instruments

        public bool IsStringed
        {
            get { return Fret >= 0 && String >= 0; }
        }

        public int Fret { get; set; }

        /// <summary>
        /// Gets or sets the string number where the note is placed. 
        /// 1 is the lowest string on the guitar and the bottom line on the tablature. 
        /// It then increases the the number of strings on available on the track. 
        /// </summary>
        public int String { get; set; }

        #endregion

        #region Piano Instruments

        public bool IsPiano
        {
            get
            {
                if (IsStringed) return false;
                return Octave >= 0 && Tone >= 0;
            }
        }

        public int Octave { get; set; }
        public int Tone { get; set; }

        #endregion

        #region Percussion

        public bool IsPercussion
        {
            get
            {
                if (IsStringed) return false;
                return Element >= 0 && Variation >= 0;
            }
        }


        public int Element { get; set; }
        public int Variation { get; set; }

        #endregion

        public bool IsHammerPullOrigin { get; set; }
        public bool IsHammerPullDestination { get { return HammerPullOrigin != null; } }
        public Note HammerPullOrigin { get; set; }
        public Note HammerPullDestination { get; set; }

        public bool IsHarmonic { get { return HarmonicType != HarmonicType.None; } }
        public float HarmonicValue { get; set; }
        public HarmonicType HarmonicType { get; set; }

        public bool IsGhost { get; set; }
        public bool IsLetRing { get; set; }
        public bool IsPalmMute { get; set; }
        public bool IsDead { get; set; }
        public bool IsStaccato { get; set; }

        public SlideType SlideType { get; set; }
        public Note SlideTarget { get; set; }

        public VibratoType Vibrato { get; set; }

        public Note TieOrigin { get; set; }
        public Note TieDestination { get; set; }
        public bool IsTieDestination { get; set; }
        public bool IsTieOrigin { get; set; }

        public Fingers LeftHandFinger { get; set; }
        public Fingers RightHandFinger { get; set; }
        public bool IsFingering { get; set; }

        public int TrillValue { get; set; }
        public int TrillFret
        {
            get
            {
                return TrillValue - StringTuning;
            }
        }

        public bool IsTrill
        {
            get
            {
                return TrillValue >= 0;
            }
        }
        public Duration TrillSpeed { get; set; }

        public double DurationPercent { get; set; }

        public NoteAccidentalMode AccidentalMode { get; set; }

        public Beat Beat { get; set; }
        public DynamicValue Dynamic { get; set; }

        public int StringTuning
        {
            get
            {
                return Beat.Voice.Bar.Staff.Track.Capo + GetStringTuning(Beat.Voice.Bar.Staff.Track, String);
            }
        }

        public static int GetStringTuning(Track track, int noteString)
        {
            if (track.Tuning.Length > 0)
                return track.Tuning[track.Tuning.Length - (noteString - 1) - 1];
            return 0;
        }

        public int RealValue
        {
            get
            {
                if (IsPercussion)
                {
                    return PercussionMapper.MidiFromElementVariation(this);
                }
                if (IsStringed)
                {
                    return Fret + StringTuning - Beat.Voice.Bar.Staff.Track.TranspositionPitch;
                }
                if (IsPiano)
                {
                    return Octave * 12 + Tone - Beat.Voice.Bar.Staff.Track.TranspositionPitch;
                }

                return 0;
            }
        }

        public Note()
        {
            Id = GlobalNoteId++;
            BendPoints = new FastList<BendPoint>();
            Dynamic = DynamicValue.F;

            Accentuated = AccentuationType.None;
            Fret = int.MinValue;
            HarmonicType = HarmonicType.None;
            SlideType = SlideType.None;
            Vibrato = VibratoType.None;

            LeftHandFinger = Fingers.Unknown;
            RightHandFinger = Fingers.Unknown;

            TrillValue = -1;
            TrillSpeed = Duration.ThirtySecond;
            DurationPercent = 1;

            Octave = -1;
            Tone = -1;

            Fret = -1;
            String = -1;

            Element = -1;
            Variation = -1;
        }

        public static void CopyTo(Note src, Note dst)
        {
            dst.Id = src.Id;
            dst.Accentuated = src.Accentuated;
            dst.Fret = src.Fret;
            dst.String = src.String;
            dst.IsHammerPullOrigin = src.IsHammerPullOrigin;
            dst.HarmonicValue = src.HarmonicValue;
            dst.HarmonicType = src.HarmonicType;
            dst.IsGhost = src.IsGhost;
            dst.IsLetRing = src.IsLetRing;
            dst.IsPalmMute = src.IsPalmMute;
            dst.IsDead = src.IsDead;
            dst.IsStaccato = src.IsStaccato;
            dst.SlideType = src.SlideType;
            dst.Vibrato = src.Vibrato;
            dst.IsTieDestination = src.IsTieDestination;
            dst.LeftHandFinger = src.LeftHandFinger;
            dst.RightHandFinger = src.RightHandFinger;
            dst.IsFingering = src.IsFingering;
            dst.TrillValue = src.TrillValue;
            dst.TrillSpeed = src.TrillSpeed;
            dst.DurationPercent = src.DurationPercent;
            dst.AccidentalMode = src.AccidentalMode;
            dst.Dynamic = src.Dynamic;
            dst.Octave = src.Octave;
            dst.Tone = src.Tone;
            dst.Element = src.Element;
            dst.Variation = src.Variation;
        }

        public Note Clone()
        {
            var n = new Note();
            CopyTo(this, n);
            for (int i = 0, j = BendPoints.Count; i < j; i++)
            {
                n.AddBendPoint(BendPoints[i].Clone());
            }
            return n;
        }

        public void AddBendPoint(BendPoint point)
        {
            BendPoints.Add(point);
            if (MaxBendPoint == null || point.Value > MaxBendPoint.Value)
            {
                MaxBendPoint = point;
            }
        }


        public void Finish()
        {
            var nextNoteOnLine = new Util.Lazy<Note>(() => NextNoteOnSameLine(this));
            var prevNoteOnLine = new Util.Lazy<Note>(() => PreviousNoteOnSameLine(this));

            // connect ties
            if (IsTieDestination)
            {
                if (prevNoteOnLine.Value == null)
                {
                    IsTieDestination = false;
                }
                else
                {
                    TieOrigin = prevNoteOnLine.Value;
                    TieOrigin.IsTieOrigin = true;
                    TieOrigin.TieDestination = this;
                    Fret = TieOrigin.Fret;
                    Octave = TieOrigin.Octave;
                    Tone = TieOrigin.Tone;
                }
            }

            // set hammeron/pulloffs
            if (IsHammerPullOrigin)
            {
                if (nextNoteOnLine.Value == null)
                {
                    IsHammerPullOrigin = false;
                }
                else
                {
                    HammerPullDestination = nextNoteOnLine.Value;
                    HammerPullDestination.HammerPullOrigin = this;
                }
            }

            // set slides
            if (SlideType != SlideType.None)
            {
                SlideTarget = nextNoteOnLine.Value;
            }
        }

        private const int MaxOffsetForSameLineSearch = 3;
        private static Note NextNoteOnSameLine(Note note)
        {
            var nextBeat = note.Beat.NextBeat;
            // keep searching in same bar
            while (nextBeat != null && nextBeat.Voice.Bar.Index <= note.Beat.Voice.Bar.Index + MaxOffsetForSameLineSearch)
            {
                var noteOnString = nextBeat.GetNoteOnString(note.String);
                if (noteOnString != null)
                {
                    return noteOnString;
                }
                else
                {
                    nextBeat = nextBeat.NextBeat;
                }
            }

            return null;
        }

        private static Note PreviousNoteOnSameLine(Note note)
        {
            var previousBeat = note.Beat.PreviousBeat;

            // keep searching in same bar
            while (previousBeat != null && previousBeat.Voice.Bar.Index >= note.Beat.Voice.Bar.Index - MaxOffsetForSameLineSearch)
            {
                var noteOnString = previousBeat.GetNoteOnString(note.String);
                if (noteOnString != null)
                {
                    return noteOnString;
                }
                else
                {
                    previousBeat = previousBeat.PreviousBeat;
                }
            }

            return null;
        }

    }
}