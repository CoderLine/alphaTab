using System;
using System.Collections.Generic;
using System.Runtime.CompilerServices;
using AlphaTab.Collections;

namespace AlphaTab.Model
{
    /// <summary>
    /// A note is a single played sound on a fretted instrument. 
    /// It consists of a fret offset and a string on which the note is played on.
    /// It also can be modified by a lot of different effects.  
    /// </summary>
    public class Note
    {
        [IntrinsicProperty]
        public AccentuationType Accentuated { get; set; }
        [IntrinsicProperty]
        public FastList<BendPoint> BendPoints { get; set; }
        public bool HasBend { get { return BendPoints.Count > 0; } }

        [IntrinsicProperty]
        public int Fret { get; set; }
        [IntrinsicProperty]
        public int String { get; set; }

        [IntrinsicProperty]
        public bool IsHammerPullOrigin { get; set; }
        [IntrinsicProperty]
        public Note HammerPullOrigin { get; set; }
        [IntrinsicProperty]
        public Note HammerPullDestination { get; set; }

        [IntrinsicProperty]
        public float HarmonicValue { get; set; }
        [IntrinsicProperty]
        public HarmonicType HarmonicType { get; set; }

        [IntrinsicProperty]
        public bool IsGhost { get; set; }
        [IntrinsicProperty]
        public bool IsLetRing { get; set; }
        [IntrinsicProperty]
        public bool IsPalmMute { get; set; }
        [IntrinsicProperty]
        public bool IsDead { get; set; }
        [IntrinsicProperty]
        public bool IsStaccato { get; set; }

        [IntrinsicProperty]
        public SlideType SlideType { get; set; }
        [IntrinsicProperty]
        public Note SlideTarget { get; set; }

        [IntrinsicProperty]
        public VibratoType Vibrato { get; set; }

        [IntrinsicProperty]
        public Note TieOrigin { get; set; }
        [IntrinsicProperty]
        public bool IsTieDestination { get; set; }
        [IntrinsicProperty]
        public bool IsTieOrigin { get; set; }

        [IntrinsicProperty]
        public Fingers LeftHandFinger { get; set; }
        [IntrinsicProperty]
        public Fingers RightHandFinger { get; set; }
        [IntrinsicProperty]
        public bool IsFingering { get; set; }

        [IntrinsicProperty]
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
        [IntrinsicProperty]
        public Duration TrillSpeed { get; set; }

        [IntrinsicProperty]
        public double DurationPercent { get; set; }

        [IntrinsicProperty]
        public bool SwapAccidentals { get; set; }

        [IntrinsicProperty]
        public Beat Beat { get; set; }
        [IntrinsicProperty]
        public DynamicValue Dynamic { get; set; }

        [IntrinsicProperty]
        public int Octave { get; set; }
        [IntrinsicProperty]
        public int Tone { get; set; }

        public int StringTuning
        {
            get
            {
                if (Beat.Voice.Bar.Track.Tuning.Count > 0)
                    return Beat.Voice.Bar.Track.Tuning[Beat.Voice.Bar.Track.Tuning.Count - (String - 1) - 1];
                return 0;
            }
        }

        public int RealValue
        {
            get
            {
                if (Fret == -1)
                    return Octave * 12 + Tone;
                return Fret + StringTuning;
            }
        }

        public Note()
        {
            BendPoints = new FastList<BendPoint>();
            Dynamic = DynamicValue.F;

            Accentuated = AccentuationType.None;
            Fret = -1;
            HarmonicType = HarmonicType.None;
            SlideType = SlideType.None;
            Vibrato = VibratoType.None;

            LeftHandFinger = Fingers.NoOrDead;
            RightHandFinger = Fingers.NoOrDead;

            TrillValue = -1;
            TrillSpeed = Duration.ThirtySecond;
            DurationPercent = 1;
            Octave = -1;
        }

        public Note Clone()
        {
            var n = new Note();
            
            n.Accentuated = Accentuated;
            for (int i = 0; i < BendPoints.Count; i++)
            {
                n.BendPoints.Add(BendPoints[i].Clone());
            }
            n.Fret = Fret;
            n.String = String;
            n.IsHammerPullOrigin = IsHammerPullOrigin;
            n.HammerPullOrigin = HammerPullOrigin;
            n.HammerPullDestination = HammerPullDestination;
            n.HarmonicValue = HarmonicValue;
            n.HarmonicType = HarmonicType;
            n.IsGhost = IsGhost;
            n.IsLetRing = IsLetRing;
            n.IsPalmMute = IsPalmMute;
            n.IsDead = IsDead;
            n.IsStaccato = IsStaccato;
            n.SlideType = SlideType;
            n.SlideTarget = SlideTarget;
            n.Vibrato = Vibrato;
            n.TieOrigin = TieOrigin;
            n.IsTieDestination = IsTieDestination;
            n.IsTieOrigin = IsTieOrigin;
            n.LeftHandFinger = LeftHandFinger;
            n.RightHandFinger = RightHandFinger;
            n.IsFingering = IsFingering;
            n.TrillValue = TrillValue;
            n.TrillSpeed = TrillSpeed;
            n.DurationPercent = DurationPercent;
            n.SwapAccidentals = SwapAccidentals;
            n.Dynamic = Dynamic;
            n.Octave = Octave;
            n.Tone = Tone;

            return n;
        }

        public void Finish()
        {
            var nextNoteOnLine = new Lazy<Note>(() => NextNoteOnSameLine(this));
            var prevNoteOnLine = new Lazy<Note>(() => PreviousNoteOnSameLine(this));

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
                    Fret = TieOrigin.Fret;
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