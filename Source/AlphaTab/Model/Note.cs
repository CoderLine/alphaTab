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
using AlphaTab.Collections;
using AlphaTab.Platform;
using AlphaTab.Rendering.Utils;
using AlphaTab.Util;

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
    /// Lists the different bend styles
    /// </summary>
    public enum BendStyle
    {
        /// <summary>
        /// The bends are as described by the bend points 
        /// </summary>
        Default,
        /// <summary>
        /// The bends are gradual over the beat duration. 
        /// </summary>
        Gradual,
        /// <summary>
        /// The bends are done fast before the next note. 
        /// </summary>
        Fast
    }

    /// <summary>
    /// Lists all types of bends 
    /// </summary>
    public enum BendType
    {
        /// <summary>
        /// No bend at all
        /// </summary>
        None,
        /// <summary>
        /// Individual points define the bends in a flexible manner. 
        /// This system was mainly used in Guitar Pro 3-5
        /// </summary>
        Custom,
        /// <summary>
        /// Simple Bend from an unbended string to a higher note. 
        /// </summary>
        Bend,
        /// <summary>
        /// Release of a bend that was started on an earlier note.
        /// </summary>
        Release,
        /// <summary>
        /// A bend that starts from an unbended string, 
        /// and also releases the bend after some time.
        /// </summary>
        BendRelease,
        /// <summary>
        /// Holds a bend that was started on an earlier note
        /// </summary>
        Hold,
        /// <summary>
        /// A bend that is already started before the note is played then it is held until the end. 
        /// </summary>
        Prebend,
        /// <summary>
        /// A bend that is already started before the note is played and
        /// bends even further, then it is held until the end. 
        /// </summary>
        PrebendBend,
        /// <summary>
        /// A bend that is already started before the note is played and
        /// then releases the bend to a lower note where it is held until the end.
        /// </summary>
        PrebendRelease,
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
        public BendType BendType { get; set; }
        public BendStyle BendStyle { get; set; }
        public bool IsContinuedBend { get; set; }
        public FastList<BendPoint> BendPoints { get; set; }
        public BendPoint MaxBendPoint { get; set; }
        public bool HasBend { get { return BendType != BendType.None; } }

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


        public bool IsVisible { get; set; }

        public bool IsHammerPullOrigin { get; set; }
        public bool IsHammerPullDestination { get { return HammerPullOrigin != null; } }
        public Note HammerPullOrigin { get; set; }
        public Note HammerPullDestination { get; set; }

        public bool IsSlurOrigin { get; set; }
        public bool IsSlurDestination { get { return SlurOrigin != null; } }
        public Note SlurOrigin { get; set; }
        public Note SlurDestination { get; set; }


        public bool IsHarmonic { get { return HarmonicType != HarmonicType.None; } }
        public float HarmonicValue { get; set; }
        public HarmonicType HarmonicType { get; set; }

        public bool IsGhost { get; set; }
        public bool IsLetRing { get; set; }
        public Note LetRingDestination { get; set; }

        public bool IsPalmMute { get; set; }
        public Note PalmMuteDestination { get; set; }

        public bool IsDead { get; set; }
        public bool IsStaccato { get; set; }

        public SlideType SlideType { get; set; }
        public Note SlideTarget { get; set; }

        public VibratoType Vibrato { get; set; }

        public Note TieOrigin { get; set; }
        public Note TieDestination { get; set; }
        public bool IsTieDestination { get; set; }
        public bool IsTieOrigin { get; set; }

        public Note BendOrigin { get; set; }

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
                return Beat.Voice.Bar.Staff.Capo + GetStringTuning(Beat.Voice.Bar.Staff, String);
            }
        }

        public static int GetStringTuning(Staff staff, int noteString)
        {
            if (staff.Tuning.Length > 0)
                return staff.Tuning[staff.Tuning.Length - (noteString - 1) - 1];
            return 0;
        }

        /// <summary>
        /// Gets the absolute value of this note for playback. 
        /// </summary>
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
                    if (HarmonicType == HarmonicType.Natural)
                    {
                        return HarmonicPitch + StringTuning - Beat.Voice.Bar.Staff.TranspositionPitch;
                    }
                    else
                    {
                        return Fret + StringTuning - Beat.Voice.Bar.Staff.TranspositionPitch + HarmonicPitch;
                    }
                }
                if (IsPiano)
                {
                    return Octave * 12 + Tone - Beat.Voice.Bar.Staff.TranspositionPitch;
                }

                return 0;
            }
        }

        public int HarmonicPitch
        {
            get
            {
                if (HarmonicType == HarmonicType.None || !IsStringed) return 0;

                var value = HarmonicValue;

                // add semitones to reach corresponding harmonic frets
                if (value.IsAlmostEqualTo(2.4f))
                {
                    return 36;
                }
                else if (value.IsAlmostEqualTo(2.7f))
                {
                    // Fret 3 2nd octave + minor seventh
                    return 34;
                }
                else if (value < 3)
                {
                    // no natural harmonics below fret 3
                    return 0;
                }
                else if (value <= 3.5 /*3.2*/)
                {
                    // Fret 3 2nd octave + fifth
                    return 31;
                }
                else if (value <= 4)
                {
                    return 28;
                }
                else if (value <= 5)
                {
                    return 24;
                }
                else if (value <= 6 /* 5.8 */)
                {
                    return 34;
                }
                else if (value <= 7)
                {
                    return 19;
                }
                else if (value <= 8.5 /*8.2*/)
                {
                    return 36;
                }
                else if (value <= 9)
                {
                    return 28;
                }
                else if (value <= 10 /*9.6*/)
                {
                    return 34;
                }
                else if (value <= 11)
                {
                    return 0;
                }
                else if (value <= 12)
                {
                    return 12;
                }
                else if (value < 14)
                {
                    // fret 13,14 stay
                    return 0;
                }
                else if (value <= 15 /*14.7*/)
                {
                    return 34;
                }
                else if (value <= 16)
                {
                    return 28;
                }
                else if (value <= 17)
                {
                    return 36;
                }
                else if (value <= 18)
                {
                    return 0;
                }
                else if (value <= 19)
                {
                    return 19;
                }
                else if (value <= 21)
                {
                    //  20,21 stay
                    return 0;
                }
                else if (value <= 22 /* 21.7 */)
                {
                    return 36;
                }
                else if (value <= 24)
                {
                    return 24;
                }

                return 0;
            }
        }

        /// <summary>
        /// Gets the absolute value of this note considering
        /// offsets by bends and ottavia
        /// </summary>
        public int DisplayValue
        {
            get
            {
                var noteValue = DisplayValueWithoutBend;

                if (HasBend)
                {
                    noteValue += BendPoints[0].Value / 2;
                }
                else if (BendOrigin != null)
                {
                    noteValue += BendOrigin.BendPoints[BendOrigin.BendPoints.Count - 1].Value / 2;
                }
                else if (IsTieDestination && TieOrigin.BendOrigin != null)
                {
                    noteValue += TieOrigin.BendOrigin.BendPoints[TieOrigin.BendOrigin.BendPoints.Count - 1].Value / 2;
                }
                else if (Beat.HasWhammyBar)
                {
                    noteValue += Beat.WhammyBarPoints[0].Value / 2;
                }
                else if (Beat.IsContinuedWhammy)
                {
                    noteValue += Beat.PreviousBeat.WhammyBarPoints[Beat.PreviousBeat.WhammyBarPoints.Count - 1].Value / 2;
                }


                return noteValue;
            }
        }

        /// <summary>
        /// Gets the absolute value of this note considering all effects beside bends. 
        /// </summary>
        public int DisplayValueWithoutBend
        {
            get
            {
                var noteValue = RealValue;

                if (HarmonicType != HarmonicType.Natural && HarmonicType != HarmonicType.None)
                {
                    noteValue -= HarmonicPitch;
                }

                switch (Beat.Ottava)
                {
                    case Ottavia._15ma:
                        noteValue -= 24;
                        break;
                    case Ottavia._8va:
                        noteValue -= 12;
                        break;
                    case Ottavia.Regular:
                        break;
                    case Ottavia._8vb:
                        noteValue += 12;
                        break;
                    case Ottavia._15mb:
                        noteValue += 24;
                        break;
                }

                switch (Beat.Voice.Bar.ClefOttava)
                {
                    case Ottavia._15ma:
                        noteValue -= 24;
                        break;
                    case Ottavia._8va:
                        noteValue -= 12;
                        break;
                    case Ottavia.Regular:
                        break;
                    case Ottavia._8vb:
                        noteValue += 12;
                        break;
                    case Ottavia._15mb:
                        noteValue += 24;
                        break;
                }

                return noteValue - Beat.Voice.Bar.Staff.DisplayTranspositionPitch;
            }
        }

        /// <summary>
        /// Gets or sets whether the note has a offset of a quartertone caused by bends.
        /// </summary>
        public bool HasQuarterToneOffset
        {
            get
            {
                if (HasBend)
                {
                    return (BendPoints[0].Value % 2) != 0;
                }
                if (BendOrigin != null)
                {
                    return (BendOrigin.BendPoints[BendOrigin.BendPoints.Count - 1].Value % 2) != 0;
                }
                if (Beat.HasWhammyBar)
                {
                    return (Beat.WhammyBarPoints[0].Value % 2) != 0;
                }
                if (Beat.IsContinuedWhammy)
                {
                    return (Beat.PreviousBeat.WhammyBarPoints[Beat.PreviousBeat.WhammyBarPoints.Count - 1].Value % 2) != 0;
                }
                return false;
            }
        }


        public Note()
        {
            Id = GlobalNoteId++;
            BendType = BendType.None;
            BendStyle = BendStyle.Default;
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
            IsVisible = true;
        }

        public static void CopyTo(Note src, Note dst)
        {
            dst.Id = src.Id;
            dst.Accentuated = src.Accentuated;
            dst.Fret = src.Fret;
            dst.String = src.String;
            dst.IsHammerPullOrigin = src.IsHammerPullOrigin;
            dst.IsSlurOrigin = src.IsSlurOrigin;
            dst.HarmonicValue = src.HarmonicValue;
            dst.HarmonicType = src.HarmonicType;
            dst.IsGhost = src.IsGhost;
            dst.IsLetRing = src.IsLetRing;
            dst.IsPalmMute = src.IsPalmMute;
            dst.IsDead = src.IsDead;
            dst.IsStaccato = src.IsStaccato;
            dst.SlideType = src.SlideType;
            dst.Vibrato = src.Vibrato;
            dst.IsTieOrigin = src.IsTieOrigin;
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
            dst.BendType = src.BendType;
            dst.BendStyle = src.BendStyle;
            dst.IsContinuedBend = src.IsContinuedBend;
            dst.IsVisible = src.IsVisible;
        }

        public Note Clone()
        {
            var n = new Note();
            var id = n.Id;
            CopyTo(this, n);
            for (int i = 0, j = BendPoints.Count; i < j; i++)
            {
                n.AddBendPoint(BendPoints[i].Clone());
            }
            n.Id = id;
            return n;
        }

        public void AddBendPoint(BendPoint point)
        {
            BendPoints.Add(point);
            if (MaxBendPoint == null || point.Value > MaxBendPoint.Value)
            {
                MaxBendPoint = point;
            }

            if (BendType == BendType.None)
            {
                BendType = BendType.Custom;
            }
        }

        public void Finish(Settings settings)
        {
            var nextNoteOnLine = new Util.Lazy<Note>(() => NextNoteOnSameLine(this));
            var prevNoteOnLine = new Util.Lazy<Note>(() => PreviousNoteOnSameLine(this));

            var isSongBook = settings != null && settings.DisplayMode == DisplayMode.SongBook;

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

                    if (TieOrigin.HasBend)
                    {
                        BendOrigin = TieOrigin;
                    }
                }

                // implicit let ring 
                if (isSongBook && TieOrigin.IsLetRing)
                {
                    IsLetRing = true;
                }
            }

            // connect letring
            if (IsLetRing)
            {
                if (nextNoteOnLine.Value == null || !nextNoteOnLine.Value.IsLetRing)
                {
                    LetRingDestination = this;
                }
                else
                {
                    LetRingDestination = nextNoteOnLine.Value;
                }

                if (isSongBook && IsTieDestination && !TieOrigin.HasBend)
                {
                    IsVisible = false;
                }
            }


            // connect palmmute
            if (IsPalmMute)
            {
                if (nextNoteOnLine.Value == null || !nextNoteOnLine.Value.IsPalmMute)
                {
                    PalmMuteDestination = this;
                }
                else
                {
                    PalmMuteDestination = nextNoteOnLine.Value;
                }
            }

            if (IsHammerPullOrigin || SlideType == SlideType.Legato)
            {
                IsSlurOrigin = true;
                SlurDestination = nextNoteOnLine.Value;
                if (!IsSlurDestination)
                {
                    SlurOrigin = this;
                    if (SlurDestination != null)
                    {
                        SlurDestination.SlurOrigin = this;
                    }
                }
                else
                {
                    SlurOrigin.SlurDestination = SlurDestination;
                    if (SlurDestination != null)
                    {
                        SlurDestination.SlurOrigin = SlurOrigin;
                    }
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

            // try to detect what kind of bend was used and cleans unneeded points if required
            // Guitar Pro 6 and above (gpif.xml) uses exactly 4 points to define all bends
            if (BendPoints.Count > 0 && BendType == BendType.Custom)
            {
                var isContinuedBend = IsContinuedBend = TieOrigin != null && TieOrigin.HasBend;
                if (BendPoints.Count == 4)
                {
                    var origin = BendPoints[0];
                    var middle1 = BendPoints[1];
                    var middle2 = BendPoints[2];
                    var destination = BendPoints[3];

                    // the middle points are used for holds, anything else is a new feature we do not support yet
                    if (middle1.Value == middle2.Value)
                    {
                        // bend higher?
                        if (destination.Value > origin.Value)
                        {
                            if (middle1.Value > destination.Value)
                            {
                                BendType = BendType.BendRelease;
                            }
                            else if (!isContinuedBend && origin.Value > 0)
                            {
                                BendType = BendType.PrebendBend;
                                BendPoints.RemoveAt(2);
                                BendPoints.RemoveAt(1);
                            }
                            else
                            {
                                BendType = BendType.Bend;
                                BendPoints.RemoveAt(2);
                                BendPoints.RemoveAt(1);
                            }
                        }
                        // release?
                        else if (destination.Value < origin.Value)
                        {
                            // origin must be > 0 otherwise it's no release, we cannot bend negative 
                            if (isContinuedBend)
                            {
                                BendType = BendType.Release;
                                BendPoints.RemoveAt(2);
                                BendPoints.RemoveAt(1);
                            }
                            else
                            {
                                BendType = BendType.PrebendRelease;
                                BendPoints.RemoveAt(2);
                                BendPoints.RemoveAt(1);
                            }
                        }
                        // hold?
                        else
                        {
                            if (middle1.Value > origin.Value)
                            {
                                BendType = BendType.BendRelease;
                            }
                            else if (origin.Value > 0 && !isContinuedBend)
                            {
                                BendType = BendType.Prebend;
                                BendPoints.RemoveAt(2);
                                BendPoints.RemoveAt(1);
                            }
                            else
                            {
                                BendType = BendType.Hold;
                                BendPoints.RemoveAt(2);
                                BendPoints.RemoveAt(1);
                            }
                        }
                    }
                    else
                    {
                        Logger.Warning("Model", "Unsupported bend type detected, fallback to custom");
                    }
                }
                else if (BendPoints.Count == 2)
                {
                    var origin = BendPoints[0];
                    var destination = BendPoints[1];

                    // bend higher?
                    if (destination.Value > origin.Value)
                    {
                        if (!isContinuedBend && origin.Value > 0)
                        {
                            BendType = BendType.PrebendBend;
                        }
                        else
                        {
                            BendType = BendType.Bend;
                        }
                    }
                    // release?
                    else if (destination.Value < origin.Value)
                    {
                        // origin must be > 0 otherwise it's no release, we cannot bend negative 
                        if (isContinuedBend)
                        {
                            BendType = BendType.Release;
                        }
                        else
                        {
                            BendType = BendType.PrebendRelease;
                        }
                    }
                    // hold?
                    else
                    {
                        BendType = BendType.Hold;
                    }
                }
            }
            else if (BendPoints.Count == 0)
            {
                BendType = BendType.None;
            }
        }

        private const int MaxOffsetForSameLineSearch = 3;
        public static Note NextNoteOnSameLine(Note note)
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

        public static Note PreviousNoteOnSameLine(Note note)
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