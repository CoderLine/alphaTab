using AlphaTab.Collections;
using AlphaTab.Platform;
using AlphaTab.Rendering.Utils;
using AlphaTab.Util;

namespace AlphaTab.Model
{
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
        internal static int GlobalNoteId;

        /// <summary>
        /// Gets or sets the unique id of this note.
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// Gets or sets the zero-based index of this note within the beat.
        /// </summary>
        public int Index { get; set; }

        /// <summary>
        /// Gets or sets the accentuation of this note.
        /// </summary>
        public AccentuationType Accentuated { get; set; }

        /// <summary>
        /// Gets or sets the bend type for this note.
        /// </summary>
        public BendType BendType { get; set; }

        /// <summary>
        /// Gets or sets the bend style for this note.
        /// </summary>
        public BendStyle BendStyle { get; set; }

        /// <summary>
        /// Gets or sets the note from which this note continues the bend.
        /// </summary>
        public Note BendOrigin { get; set; }

        /// <summary>
        /// Gets or sets whether this note continues a bend from a previous note.
        /// </summary>
        public bool IsContinuedBend { get; set; }

        /// <summary>
        /// Gets or sets a list of the points defining the bend behavior.
        /// </summary>
        public FastList<BendPoint> BendPoints { get; set; }

        /// <summary>
        /// Gets or sets the bend point with the highest bend value.
        /// </summary>
        public BendPoint MaxBendPoint { get; set; }

        /// <summary>
        /// Gets a value indicating whether this note is bended.
        /// </summary>
        public bool HasBend => BendType != BendType.None;

        #region Stringed Instruments

        /// <summary>
        /// Gets a value indicating whether this note is defined via a string on the instrument. .
        /// </summary>
        public bool IsStringed => String >= 0;

        /// <summary>
        /// Gets or sets the fret on which this note is played on the instrument.
        /// </summary>
        public int Fret { get; set; }

        /// <summary>
        /// Gets or sets the string number where the note is placed.
        /// 1 is the lowest string on the guitar and the bottom line on the tablature.
        /// It then increases the the number of strings on available on the track.
        /// </summary>
        public int String { get; set; }

        #endregion

        #region Piano Instruments

        /// <summary>
        /// Gets a value indicating whether the value of this note is defined via octave and tone.
        /// </summary>
        public bool IsPiano => !IsStringed && Octave >= 0 && Tone >= 0;

        /// <summary>
        /// Gets or sets the octave on which this note is played.
        /// </summary>
        public int Octave { get; set; }

        /// <summary>
        /// Gets or sets the tone of this note within the octave.
        /// </summary>
        public int Tone { get; set; }

        #endregion

        #region Percussion

        /// <summary>
        /// Gets a value indicating whether this note is a percussion note.
        /// </summary>
        public bool IsPercussion => !IsStringed && Element >= 0 && Variation >= 0;

        /// <summary>
        /// Gets or sets the percusson element.
        /// </summary>
        public int Element { get; set; }

        /// <summary>
        /// Gets or sets the variation of this note.
        /// </summary>
        public int Variation { get; set; }

        #endregion

        /// <summary>
        /// Gets or sets whether this note is visible on the music sheet.
        /// </summary>
        public bool IsVisible { get; set; }

        /// <summary>
        /// Gets or sets whether this note starts a hammeron or pulloff.
        /// </summary>
        public bool IsHammerPullOrigin { get; set; }

        /// <summary>
        /// Gets a value indicating whether this note ends a hammeron or pulloff.
        /// </summary>
        public bool IsHammerPullDestination => HammerPullOrigin != null;

        /// <summary>
        /// Gets the origin of the hammeron/pulloff of this note.
        /// </summary>
        public Note HammerPullOrigin { get; set; }

        /// <summary>
        /// Gets the destination for the hammeron/pullof started by this note.
        /// </summary>
        public Note HammerPullDestination { get; set; }

        /// <summary>
        /// Gets or sets whether this note starts a slur.
        /// </summary>
        public bool IsSlurOrigin => SlurDestination != null;

        /// <summary>
        /// Gets or sets whether this note finishes a slur.
        /// </summary>
        public bool IsSlurDestination { get; set; }

        /// <summary>
        /// Gets or sets the note where the slur of this note starts.
        /// </summary>
        public Note SlurOrigin { get; set; }

        /// <summary>
        /// Gets or sets the note where the slur of this note ends.
        /// </summary>
        public Note SlurDestination { get; set; }

        /// <summary>
        /// Gets or sets whether this note has an harmonic effect.
        /// </summary>
        public bool IsHarmonic => HarmonicType != HarmonicType.None;

        /// <summary>
        /// Gets or sets the harmonic type applied to this note.
        /// </summary>
        public HarmonicType HarmonicType { get; set; }

        /// <summary>
        /// Gets or sets the value defining the harmonic pitch.
        /// </summary>
        public float HarmonicValue { get; set; }

        /// <summary>
        /// Gets or sets whether the note is a ghost note and shown in parenthesis. Also this will make the note a bit more silent.
        /// </summary>
        public bool IsGhost { get; set; }

        /// <summary>
        /// Gets or sets whether this note has a let-ring effect.
        /// </summary>
        public bool IsLetRing { get; set; }

        /// <summary>
        /// Gets or sets the destination note for the let-ring effect.
        /// </summary>
        public Note LetRingDestination { get; set; }

        /// <summary>
        /// Gets or sets whether this note has a palm-mute effect.
        /// </summary>
        public bool IsPalmMute { get; set; }

        /// <summary>
        /// Gets or sets the destination note for the palm-mute effect.
        /// </summary>
        public Note PalmMuteDestination { get; set; }

        /// <summary>
        /// Gets or sets whether the note is shown and played as dead note.
        /// </summary>
        public bool IsDead { get; set; }

        /// <summary>
        /// Gets or sets whether the note is played as staccato.
        /// </summary>
        public bool IsStaccato { get; set; }

        /// <summary>
        /// Gets or sets the slide type this note is played with.
        /// </summary>
        public SlideType SlideType { get; set; }

        /// <summary>
        /// Gets or sets the target note for several slide types.
        /// </summary>
        public Note SlideTarget { get; set; }

        /// <summary>
        /// Gets or sets whether a vibrato is played on the note.
        /// </summary>
        public VibratoType Vibrato { get; set; }

        /// <summary>
        /// Gets or sets the origin of the tied if this note is tied.
        /// </summary>
        public Note TieOrigin { get; set; }

        /// <summary>
        /// Gets or sets the desination of the tie.
        /// </summary>
        public Note TieDestination { get; set; }

        /// <summary>
        /// Gets or sets whether this note is ends a tied note.
        /// </summary>
        public bool IsTieDestination { get; set; }

        /// <summary>
        /// Gets or sets whether this note starts or continues a tied note.
        /// </summary>
        public bool IsTieOrigin => TieDestination != null;

        /// <summary>
        /// Gets or sets the fingers used for this note on the left hand.
        /// </summary>
        public Fingers LeftHandFinger { get; set; }

        /// <summary>
        /// Gets or sets the fingers used for this note on the right hand.
        /// </summary>
        public Fingers RightHandFinger { get; set; }

        /// <summary>
        /// Gets or sets whether this note has fingering defined.
        /// </summary>
        public bool IsFingering { get; set; }

        /// <summary>
        /// Gets or sets the target note value for the trill effect.
        /// </summary>
        public int TrillValue { get; set; }

        /// <summary>
        /// Gets the fret for the trill.
        /// </summary>
        public int TrillFret => TrillValue - StringTuning;

        /// <summary>
        /// Gets a value indicating whether this note has a trill effect.
        /// </summary>
        public bool IsTrill => TrillValue >= 0;

        /// <summary>
        /// Gets or sets the speed of the trill effect.
        /// </summary>
        public Duration TrillSpeed { get; set; }

        /// <summary>
        /// Gets or sets the percentual duration of the note relative to the overall beat duration .
        /// </summary>
        public double DurationPercent { get; set; }

        /// <summary>
        /// Gets or sets how accidetnals for this note should  be handled.
        /// </summary>
        public NoteAccidentalMode AccidentalMode { get; set; }

        /// <summary>
        /// Gets or sets the reference to the parent beat to which this note belongs to.
        /// </summary>
        public Beat Beat { get; set; }

        /// <summary>
        /// Gets or sets the dynamics for this note.
        /// </summary>
        public DynamicValue Dynamics { get; set; }

        internal bool IsEffectSlurOrigin { get; set; }
        internal bool HasEffectSlur { get; set; }
        internal bool IsEffectSlurDestination => EffectSlurOrigin != null;
        internal Note EffectSlurOrigin { get; set; }
        internal Note EffectSlurDestination { get; set; }


        /// <summary>
        /// Gets the base note value for the string of this note.
        /// </summary>
        public int StringTuning => Beat.Voice.Bar.Staff.Capo + GetStringTuning(Beat.Voice.Bar.Staff, String);

        internal static int GetStringTuning(Staff staff, int noteString)
        {
            if (staff.Tuning.Length > 0)
            {
                return staff.Tuning[staff.Tuning.Length - (noteString - 1) - 1];
            }

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

                    return Fret + StringTuning - Beat.Voice.Bar.Staff.TranspositionPitch + HarmonicPitch;
                }

                if (IsPiano)
                {
                    return Octave * 12 + Tone - Beat.Voice.Bar.Staff.TranspositionPitch;
                }

                return 0;
            }
        }

        /// <summary>
        /// Gets or sets the harmonic pitch value for this note.
        /// </summary>
        public int HarmonicPitch
        {
            get
            {
                if (HarmonicType == HarmonicType.None || !IsStringed)
                {
                    return 0;
                }

                var value = HarmonicValue;

                // add semitones to reach corresponding harmonic frets
                if (value.IsAlmostEqualTo(2.4f))
                {
                    return 36;
                }

                if (value.IsAlmostEqualTo(2.7f))
                {
                    // Fret 3 2nd octave + minor seventh
                    return 34;
                }

                if (value < 3)
                {
                    // no natural harmonics below fret 3
                    return 0;
                }

                if (value <= 3.5 /*3.2*/)
                {
                    // Fret 3 2nd octave + fifth
                    return 31;
                }

                if (value <= 4)
                {
                    return 28;
                }

                if (value <= 5)
                {
                    return 24;
                }

                if (value <= 6 /* 5.8 */)
                {
                    return 34;
                }

                if (value <= 7)
                {
                    return 19;
                }

                if (value <= 8.5 /*8.2*/)
                {
                    return 36;
                }

                if (value <= 9)
                {
                    return 28;
                }

                if (value <= 10 /*9.6*/)
                {
                    return 34;
                }

                if (value <= 11)
                {
                    return 0;
                }

                if (value <= 12)
                {
                    return 12;
                }

                if (value < 14)
                {
                    // fret 13,14 stay
                    return 0;
                }

                if (value <= 15 /*14.7*/)
                {
                    return 34;
                }

                if (value <= 16)
                {
                    return 28;
                }

                if (value <= 17)
                {
                    return 36;
                }

                if (value <= 18)
                {
                    return 0;
                }

                if (value <= 19)
                {
                    return 19;
                }

                if (value <= 21)
                {
                    //  20,21 stay
                    return 0;
                }

                if (value <= 22 /* 21.7 */)
                {
                    return 36;
                }

                if (value <= 24)
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
                    noteValue += Beat.PreviousBeat.WhammyBarPoints[Beat.PreviousBeat.WhammyBarPoints.Count - 1].Value /
                                 2;
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
                    return BendPoints[0].Value % 2 != 0;
                }

                if (BendOrigin != null)
                {
                    return BendOrigin.BendPoints[BendOrigin.BendPoints.Count - 1].Value % 2 != 0;
                }

                if (Beat.HasWhammyBar)
                {
                    return Beat.WhammyBarPoints[0].Value % 2 != 0;
                }

                if (Beat.IsContinuedWhammy)
                {
                    return Beat.PreviousBeat.WhammyBarPoints[Beat.PreviousBeat.WhammyBarPoints.Count - 1].Value % 2 !=
                           0;
                }

                return false;
            }
        }


        /// <summary>
        /// Initializes a new instance of the <see cref="Note"/> class.
        /// </summary>
        public Note()
        {
            Id = GlobalNoteId++;
            BendType = BendType.None;
            BendStyle = BendStyle.Default;
            BendPoints = new FastList<BendPoint>();
            Dynamics = DynamicValue.F;

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

        internal static void CopyTo(Note src, Note dst)
        {
            dst.Id = src.Id;
            dst.Accentuated = src.Accentuated;
            dst.Fret = src.Fret;
            dst.String = src.String;
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
            dst.IsSlurDestination = src.IsSlurDestination;
            dst.IsHammerPullOrigin = src.IsHammerPullOrigin;
            dst.LeftHandFinger = src.LeftHandFinger;
            dst.RightHandFinger = src.RightHandFinger;
            dst.IsFingering = src.IsFingering;
            dst.TrillValue = src.TrillValue;
            dst.TrillSpeed = src.TrillSpeed;
            dst.DurationPercent = src.DurationPercent;
            dst.AccidentalMode = src.AccidentalMode;
            dst.Dynamics = src.Dynamics;
            dst.Octave = src.Octave;
            dst.Tone = src.Tone;
            dst.Element = src.Element;
            dst.Variation = src.Variation;
            dst.BendType = src.BendType;
            dst.BendStyle = src.BendStyle;
            dst.IsContinuedBend = src.IsContinuedBend;
            dst.IsVisible = src.IsVisible;
        }

        internal Note Clone()
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

        internal void AddBendPoint(BendPoint point)
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

        internal void Finish(Settings settings)
        {
            var nextNoteOnLine = new Util.Lazy<Note>(() => NextNoteOnSameLine(this));

            var isSongBook = settings != null && settings.Notation.NotationMode == NotationMode.SongBook;

            // connect ties
            if (IsTieDestination)
            {
                if (TieOrigin != null)
                {
                    TieOrigin.TieDestination = this;
                }
                else
                {
                    var tieOrigin = FindTieOrigin(this);
                    if (tieOrigin == null)
                    {
                        IsTieDestination = false;
                    }
                    else
                    {
                        TieOrigin = tieOrigin;
                        TieOrigin.TieDestination = this;
                        Fret = TieOrigin.Fret;
                        Octave = TieOrigin.Octave;
                        Tone = TieOrigin.Tone;

                        if (TieOrigin.HasBend)
                        {
                            BendOrigin = TieOrigin;
                        }
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
            switch (SlideType)
            {
                case SlideType.Shift:
                case SlideType.Legato:
                    SlideTarget = nextNoteOnLine.Value;
                    if (SlideTarget == null)
                    {
                        SlideType = SlideType.None;
                    }

                    break;
            }

            Note effectSlurDestination = null;
            if (IsHammerPullOrigin)
            {
                effectSlurDestination = HammerPullDestination;
            }
            else if (SlideType == SlideType.Legato && SlideTarget != null)
            {
                effectSlurDestination = SlideTarget;
            }

            if (effectSlurDestination != null)
            {
                HasEffectSlur = true;
                if (EffectSlurOrigin != null)
                {
                    EffectSlurOrigin.EffectSlurDestination = effectSlurDestination;
                    EffectSlurOrigin.EffectSlurDestination.EffectSlurOrigin = EffectSlurOrigin;
                    EffectSlurOrigin = null;
                }
                else
                {
                    IsEffectSlurOrigin = true;
                    EffectSlurDestination = effectSlurDestination;
                    EffectSlurDestination.EffectSlurOrigin = this;
                }
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

        internal static Note NextNoteOnSameLine(Note note)
        {
            var nextBeat = note.Beat.NextBeat;
            // keep searching in same bar
            while (nextBeat != null &&
                   nextBeat.Voice.Bar.Index <= note.Beat.Voice.Bar.Index + MaxOffsetForSameLineSearch)
            {
                var noteOnString = nextBeat.GetNoteOnString(note.String);
                if (noteOnString != null)
                {
                    return noteOnString;
                }

                nextBeat = nextBeat.NextBeat;
            }

            return null;
        }

        internal static Note FindTieOrigin(Note note)
        {
            var previousBeat = note.Beat.PreviousBeat;

            // keep searching in same bar
            while (previousBeat != null &&
                   previousBeat.Voice.Bar.Index >= note.Beat.Voice.Bar.Index - MaxOffsetForSameLineSearch)
            {
                if (note.IsStringed)
                {
                    var noteOnString = previousBeat.GetNoteOnString(note.String);
                    if (noteOnString != null)
                    {
                        return noteOnString;
                    }
                }
                else
                {
                    if (note.Octave == -1 && note.Tone == -1)
                    {
                        // if the note has no value (e.g. alphaTex dash tie), we try to find a matching
                        // note on the previous beat by index.
                        if (note.Index < previousBeat.Notes.Count)
                        {
                            return previousBeat.Notes[note.Index];
                        }
                    }
                    else
                    {
                        var noteWithValue = previousBeat.GetNoteWithRealValue(note.RealValue);
                        if (noteWithValue != null)
                        {
                            return noteWithValue;
                        }
                    }
                }

                previousBeat = previousBeat.PreviousBeat;
            }

            return null;
        }
    }
}
