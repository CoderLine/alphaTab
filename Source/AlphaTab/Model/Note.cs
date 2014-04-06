using System;
using System.Collections.Generic;
using System.Runtime.CompilerServices;

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
        public List<BendPoint> BendPoints { get; set; }
        public bool HasBend { get { return BendPoints.Count > 0; } }

        [IntrinsicProperty]
        public int Fret { get; set; }
        [IntrinsicProperty]
        public int String { get; set; }


        [IntrinsicProperty]
        public Note HammerPullOrigin { get; set; }
        [IntrinsicProperty]
        public bool IsHammerPullDestination { get; set; }
        [IntrinsicProperty]
        public bool IsHammerPullOrigin { get; set; }

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

        public int StringTuning
        {
            get
            {
                return Beat.Voice.Bar.Track.Tuning[Beat.Voice.Bar.Track.Tuning.Count - (String - 1) - 1];
            }
        }

        public int RealValue
        {
            get
            {
                return Fret + StringTuning;
            }
        }

        public Note()
        {
            BendPoints = new List<BendPoint>();
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
            foreach (var p in BendPoints)
            {
                n.BendPoints.Add(p.Clone());
            }
            n.Dynamic = Dynamic;
            n.Accentuated = Accentuated;
            n.Fret = Fret;
            n.IsGhost = IsGhost;
            n.String = String;
            n.IsHammerPullDestination = IsHammerPullDestination;
            n.IsHammerPullOrigin = IsHammerPullOrigin;
            n.HarmonicValue = HarmonicValue;
            n.HarmonicType = HarmonicType;
            n.IsLetRing = IsLetRing;
            n.IsPalmMute = IsPalmMute;
            n.IsDead = IsDead;
            n.SlideType = SlideType;
            n.Vibrato = Vibrato;
            n.IsStaccato = IsStaccato;
            n.IsTieOrigin = IsTieOrigin;
            n.IsTieDestination = IsTieDestination;
            n.LeftHandFinger = LeftHandFinger;
            n.RightHandFinger = RightHandFinger;
            n.IsFingering = IsFingering;
            n.SwapAccidentals = SwapAccidentals;
            n.TrillValue = TrillValue;
            n.TrillSpeed = TrillSpeed;
            n.DurationPercent = DurationPercent;

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
                    nextNoteOnLine.Value.IsHammerPullDestination = true;
                    nextNoteOnLine.Value.HammerPullOrigin = this;
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