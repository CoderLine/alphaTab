using AlphaTab.Audio;
using AlphaTab.Collections;
using AlphaTab.Util;

namespace AlphaTab.Model
{
    /// <summary>
    /// A beat is a single block within a bar. A beat is a combination
    /// of several notes played at the same time.
    /// </summary>
    public class Beat
    {
        /// <summary>
        /// This is a global counter for all beats. We use it
        /// at several locations for lookup tables.
        /// </summary>
        private static int _globalBeatId;

        /// <summary>
        /// Gets or sets the unique id of this beat.
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// Gets or sets the zero-based index of this beat within the voice.
        /// </summary>
        public int Index { get; set; }

        /// <summary>
        /// Gets or sets the previous beat within the whole song.
        /// </summary>
        public Beat PreviousBeat { get; set; }

        /// <summary>
        /// Gets or sets the next beat within the whole song.
        /// </summary>
        public Beat NextBeat { get; set; }

        /// <summary>
        /// Gets a value indicating whether this beat is the last beat in the voice.
        /// </summary>
        public bool IsLastOfVoice => Index == Voice.Beats.Count - 1;

        /// <summary>
        /// Gets or sets the reference to the parent voice this beat belongs to.
        /// </summary>
        public Voice Voice { get; set; }

        /// <summary>
        /// Gets or sets the list of notes contained in this beat.
        /// </summary>
        public FastList<Note> Notes { get; set; }

        /// <summary>
        /// Gets the lookup where the notes per string are registered.
        /// If this staff contains string based notes this lookup allows fast access.
        /// </summary>
        public FastDictionary<int, Note> NoteStringLookup { get; }

        /// <summary>
        /// Gets the lookup where the notes per value are registered.
        /// If this staff contains string based notes this lookup allows fast access.
        /// </summary>
        public FastDictionary<int, Note> NoteValueLookup { get; }

        /// <summary>
        /// Gets or sets a value indicating whether this beat is considered empty.
        /// </summary>
        public bool IsEmpty { get; set; }

        /// <summary>
        /// Gets or sets which whammy bar style should be used for this bar.
        /// </summary>
        public BendStyle WhammyStyle { get; set; }

        /// <summary>
        /// Gets or sets the ottava applied to this beat.
        /// </summary>
        public Ottavia Ottava { get; set; }

        /// <summary>
        /// Gets or sets the fermata applied to this beat.
        /// </summary>
        public Fermata Fermata { get; set; }

        /// <summary>
        /// Gets a value indicating whether this beat starts a legato slur.
        /// </summary>
        public bool IsLegatoOrigin { get; set; }

        /// <summary>
        /// Gets a value indicating whether this beat ends a legato slur.
        /// </summary>
        public bool IsLegatoDestination => PreviousBeat != null && PreviousBeat.IsLegatoOrigin;

        /// <summary>
        /// Gets or sets the note with the lowest pitch in this beat. Only visible notes are considered.
        /// </summary>
        public Note MinNote { get; set; }

        /// <summary>
        /// Gets or sets the note with the highest pitch in this beat. Only visible notes are considered.
        /// </summary>
        public Note MaxNote { get; set; }

        /// <summary>
        /// Gets or sets the note with the highest string number in this beat. Only visible notes are considered.
        /// </summary>
        public Note MaxStringNote { get; set; }

        /// <summary>
        /// Gets or sets the note with the lowest string number in this beat. Only visible notes are considered.
        /// </summary>
        public Note MinStringNote { get; set; }

        /// <summary>
        /// Gets or sets the duration of this beat.
        /// </summary>
        public Duration Duration { get; set; }

        /// <summary>
        /// Gets or sets whether this beat is considered as rest.
        /// </summary>
        public bool IsRest => IsEmpty || Notes.Count == 0;

        /// <summary>
        /// Gets or sets whether any note in this beat has a let-ring applied.
        /// </summary>
        public bool IsLetRing { get; set; }

        /// <summary>
        /// Gets or sets whether any note in this beat has a palm-mute paplied.
        /// </summary>
        public bool IsPalmMute { get; set; }

        /// <summary>
        /// Gets or sets a list of all automations on this beat.
        /// </summary>
        public FastList<Automation> Automations { get; set; }

        /// <summary>
        /// Gets or sets the number of dots applied to the duration of this beat.
        /// </summary>
        public int Dots { get; set; }

        /// <summary>
        /// Gets or sets a value indicating whether this beat is fade-in.
        /// </summary>
        public bool FadeIn { get; set; }

        /// <summary>
        /// Gets or sets the lyrics shown on this beat.
        /// </summary>
        public string[] Lyrics { get; set; }

        /// <summary>
        /// Gets or sets a value indicating whether the beat is played in rasgueado style.
        /// </summary>
        public bool HasRasgueado { get; set; }

        /// <summary>
        /// Gets or sets a value indicating whether the notes on this beat are played with a pop-style (bass).
        /// </summary>
        public bool Pop { get; set; }

        /// <summary>
        /// Gets or sets a value indicating whether the notes on this beat are played with a slap-style (bass).
        /// </summary>
        public bool Slap { get; set; }

        /// <summary>
        /// Gets or sets a value indicating whether the notes on this beat are played with a tap-style (bass).
        /// </summary>
        public bool Tap { get; set; }

        /// <summary>
        /// Gets or sets the text annotation shown on this beat.
        /// </summary>
        public string Text { get; set; }

        /// <summary>
        /// Gets or sets the brush type applied to the notes of this beat.
        /// </summary>
        public BrushType BrushType { get; set; }

        /// <summary>
        /// Gets or sets the duration of the brush between the notes in midi ticks.
        /// </summary>
        public int BrushDuration { get; set; }

        /// <summary>
        /// Gets or sets the tuplet denominator.
        /// </summary>re
        public int TupletDenominator { get; set; }

        /// <summary>
        /// Gets or sets the tuplet numerator.
        /// </summary>
        public int TupletNumerator { get; set; }

        /// <summary>
        /// Gets or sets whether there is a tuplet applied to the duration of this beat.
        /// </summary>
        public bool HasTuplet =>
            !(TupletDenominator == -1 && TupletNumerator == -1) &&
            !(TupletDenominator == 1 && TupletNumerator == 1);

        public TupletGroup TupletGroup { get; set; }

        /// <summary>
        /// Gets or sets whether this beat continues a whammy effect.
        /// </summary>
        public bool IsContinuedWhammy { get; set; }

        /// <summary>
        /// Gets or sets the whammy bar style of this beat.
        /// </summary>
        public WhammyType WhammyBarType { get; set; }

        /// <summary>
        /// Gets or sets the points defining the whammy bar usage.
        /// </summary>
        public FastList<BendPoint> WhammyBarPoints { get; set; }

        /// <summary>
        /// Gets or sets the highest point with for the highest whammy bar value.
        /// </summary>
        public BendPoint MaxWhammyPoint { get; set; }

        /// <summary>
        /// Gets or sets the highest point with for the lowest whammy bar value.
        /// </summary>
        public BendPoint MinWhammyPoint { get; set; }

        /// <summary>
        /// Gets a value indicating whether a whammy bar is used on this beat.
        /// </summary>
        public bool HasWhammyBar => WhammyBarType != WhammyType.None;

        /// <summary>
        /// Gets or sets the vibrato effect used on this beat.
        /// </summary>
        public VibratoType Vibrato { get; set; }

        /// <summary>
        /// Gets or sets the ID of the chord used on this beat.
        /// </summary>
        public string ChordId { get; set; }

        /// <summary>
        /// Gets a value indicating whether a chord is used on this beat.
        /// </summary>
        public bool HasChord => ChordId != null;

        /// <summary>
        /// Gets the chord used on this beat.
        /// </summary>
        public Chord Chord => Voice.Bar.Staff.Chords[ChordId];

        /// <summary>
        /// Gets or sets the grace style of this beat.
        /// </summary>
        public GraceType GraceType { get; set; }

        /// <summary>
        /// Gets or sets the pickstroke applied on this beat.
        /// </summary>
        public PickStroke PickStroke { get; set; }

        /// <summary>
        /// Gets whether a tremolo effect is played on this beat.
        /// </summary>
        public bool IsTremolo => TremoloSpeed != null;

        /// <summary>
        /// Gets or sets the speed of the tremolo effect.
        /// </summary>
        public Duration? TremoloSpeed { get; set; }

        /// <summary>
        /// Gets or sets whether a crescendo/decrescendo is applied on this beat.
        /// </summary>
        public CrescendoType Crescendo { get; set; }

        /// <summary>
        /// The timeline position of the voice within the current bar as it is displayed. (unit: midi ticks)
        /// </summary>
        /// <remarks>
        /// This might differ from the actual playback time due to special grace types.
        /// </remarks>
        public int DisplayStart { get; set; }

        /// <summary>
        /// The timeline position of the voice within the current bar as it is played. (unit: midi ticks)
        /// </summary>
        /// <remarks>
        /// This might differ from the actual playback time due to special grace types.
        /// </remarks>
        public int PlaybackStart { get; set; }

        /// <summary>
        /// Gets or sets the duration that is used for the display of this beat. It defines the size/width of the beat in
        /// the music sheet. (unit: midi ticks).
        /// </summary>
        public int DisplayDuration { get; set; }

        /// <summary>
        /// Gets or sets the duration that the note is played during the audio generation.
        /// </summary>
        public int PlaybackDuration { get; set; }

        /// <summary>
        /// Gets the absolute display start time within the song.
        /// </summary>
        public int AbsoluteDisplayStart => Voice.Bar.MasterBar.Start + DisplayStart;

        /// <summary>
        /// Gets the absolute playback start time within the song.
        /// </summary>
        public int AbsolutePlaybackStart => Voice.Bar.MasterBar.Start + PlaybackStart;

        /// <summary>
        /// Gets or sets the dynamics applied to this beat.
        /// </summary>
        public DynamicValue Dynamics { get; set; }

        /// <summary>
        /// Gets or sets a value indicating whether the beam direction should be inverted.
        /// </summary>
        public bool InvertBeamDirection { get; set; }

        internal bool IsEffectSlurOrigin { get; set; }
        internal bool IsEffectSlurDestination => EffectSlurOrigin != null;
        internal Beat EffectSlurOrigin { get; set; }
        internal Beat EffectSlurDestination { get; set; }

        /// <summary>
        /// Initializes a new instance of the <see cref="Beat"/> class.
        /// </summary>
        public Beat()
        {
            Id = _globalBeatId++;
            WhammyBarType = WhammyType.None;
            WhammyBarPoints = new FastList<BendPoint>();
            Notes = new FastList<Note>();
            BrushType = BrushType.None;
            Vibrato = VibratoType.None;
            GraceType = GraceType.None;
            PickStroke = PickStroke.None;
            Duration = Duration.Quarter;
            TremoloSpeed = null;
            Automations = new FastList<Automation>();
            Dots = 0;
            DisplayStart = 0;
            DisplayDuration = 0;
            PlaybackStart = 0;
            PlaybackDuration = 0;
            TupletDenominator = -1;
            TupletNumerator = -1;
            Dynamics = DynamicValue.F;
            Crescendo = CrescendoType.None;
            InvertBeamDirection = false;
            Ottava = Ottavia.Regular;
            NoteStringLookup = new FastDictionary<int, Note>();
            NoteValueLookup = new FastDictionary<int, Note>();
            WhammyStyle = BendStyle.Default;
        }

        internal static void CopyTo(Beat src, Beat dst)
        {
            dst.Id = src.Id;
            dst.Index = src.Index;
            dst.IsEmpty = src.IsEmpty;
            dst.Duration = src.Duration;
            dst.Dots = src.Dots;
            dst.FadeIn = src.FadeIn;
            if (src.Lyrics != null)
            {
                dst.Lyrics = new string[src.Lyrics.Length];
                for (var i = 0; i < src.Lyrics.Length; i++)
                {
                    dst.Lyrics[i] = src.Lyrics[i];
                }
            }

            dst.Pop = src.Pop;
            dst.HasRasgueado = src.HasRasgueado;
            dst.Slap = src.Slap;
            dst.Tap = src.Tap;
            dst.Text = src.Text;
            dst.BrushType = src.BrushType;
            dst.BrushDuration = src.BrushDuration;
            dst.TupletDenominator = src.TupletDenominator;
            dst.TupletNumerator = src.TupletNumerator;
            dst.Vibrato = src.Vibrato;
            dst.ChordId = src.ChordId;
            dst.GraceType = src.GraceType;
            dst.PickStroke = src.PickStroke;
            dst.TremoloSpeed = src.TremoloSpeed;
            dst.Crescendo = src.Crescendo;
            dst.DisplayStart = src.DisplayStart;
            dst.DisplayDuration = src.DisplayDuration;
            dst.PlaybackStart = src.PlaybackStart;
            dst.PlaybackDuration = src.PlaybackDuration;
            dst.Dynamics = src.Dynamics;
            dst.IsLegatoOrigin = src.IsLegatoOrigin;
            dst.InvertBeamDirection = src.InvertBeamDirection;
            dst.WhammyBarType = src.WhammyBarType;
            dst.IsContinuedWhammy = src.IsContinuedWhammy;
            dst.Ottava = src.Ottava;
            dst.WhammyStyle = src.WhammyStyle;
        }

        internal Beat Clone()
        {
            var beat = new Beat();
            var id = beat.Id;
            for (int i = 0, j = WhammyBarPoints.Count; i < j; i++)
            {
                beat.AddWhammyBarPoint(WhammyBarPoints[i].Clone());
            }

            for (int i = 0, j = Notes.Count; i < j; i++)
            {
                beat.AddNoteInternal(Notes[i].Clone(), Notes[i].RealValue);
            }

            CopyTo(this, beat);
            for (int i = 0, j = Automations.Count; i < j; i++)
            {
                beat.Automations.Add(Automations[i].Clone());
            }

            beat.Id = id;
            return beat;
        }

        internal void AddWhammyBarPoint(BendPoint point)
        {
            WhammyBarPoints.Add(point);
            if (MaxWhammyPoint == null || point.Value > MaxWhammyPoint.Value)
            {
                MaxWhammyPoint = point;
            }

            if (MinWhammyPoint == null || point.Value < MinWhammyPoint.Value)
            {
                MinWhammyPoint = point;
            }

            if (WhammyBarType == WhammyType.None)
            {
                WhammyBarType = WhammyType.Custom;
            }
        }

        internal void RemoveWhammyBarPoint(int index)
        {
            // check index
            if (index < 0 || index >= WhammyBarPoints.Count)
            {
                return;
            }

            // remove point
            WhammyBarPoints.RemoveAt(index);
            var point = WhammyBarPoints[index];

            // update maxWhammy point if required
            if (point == MaxWhammyPoint)
            {
                MaxWhammyPoint = null;
                foreach (var currentPoint in WhammyBarPoints)
                {
                    if (MaxWhammyPoint == null || currentPoint.Value > MaxWhammyPoint.Value)
                    {
                        MaxWhammyPoint = currentPoint;
                    }
                }
            }

            if (point == MinWhammyPoint)
            {
                MinWhammyPoint = null;
                foreach (var currentPoint in WhammyBarPoints)
                {
                    if (MinWhammyPoint == null || currentPoint.Value < MinWhammyPoint.Value)
                    {
                        MinWhammyPoint = currentPoint;
                    }
                }
            }
        }

        internal void AddNote(Note note)
        {
            AddNoteInternal(note);
        }

        private void AddNoteInternal(Note note, int realValue = -1)
        {
            note.Beat = this;
            note.Index = Notes.Count;
            Notes.Add(note);
            if (note.IsStringed)
            {
                NoteStringLookup[note.String] = note;
            }

            if (realValue == -1)
            {
                realValue = note.RealValue;
            }

            NoteValueLookup[realValue] = note;
        }

        internal void RemoveNote(Note note)
        {
            var index = Notes.IndexOf(note);
            if (index >= 0)
            {
                Notes.RemoveAt(index);
            }
        }

        internal Automation GetAutomation(AutomationType type)
        {
            for (int i = 0, j = Automations.Count; i < j; i++)
            {
                var automation = Automations[i];
                if (automation.Type == type)
                {
                    return automation;
                }
            }

            return null;
        }

        internal Note GetNoteOnString(int @string)
        {
            if (NoteStringLookup.ContainsKey(@string))
            {
                return NoteStringLookup[@string];
            }

            return null;
        }

        private int CalculateDuration()
        {
            var ticks = Duration.ToTicks();
            if (Dots == 2)
            {
                ticks = MidiUtils.ApplyDot(ticks, true);
            }
            else if (Dots == 1)
            {
                ticks = MidiUtils.ApplyDot(ticks, false);
            }

            if (TupletDenominator > 0 && TupletNumerator >= 0)
            {
                ticks = MidiUtils.ApplyTuplet(ticks, TupletNumerator, TupletDenominator);
            }

            return ticks;
        }

        internal void UpdateDurations()
        {
            var ticks = CalculateDuration();
            PlaybackDuration = ticks;
            DisplayDuration = ticks;

            switch (GraceType)
            {
                case GraceType.BeforeBeat:
                case GraceType.OnBeat:
                    switch (Duration)
                    {
                        case Duration.Sixteenth:
                            PlaybackDuration = Duration.SixtyFourth.ToTicks();
                            break;
                        case Duration.ThirtySecond:
                            PlaybackDuration = Duration.OneHundredTwentyEighth.ToTicks();
                            break;
                        case Duration.Eighth:
                        default:
                            PlaybackDuration = Duration.ThirtySecond.ToTicks();
                            break;
                    }

                    break;
                case GraceType.BendGrace:
                    PlaybackDuration /= 2;
                    break;
                default:

                    var previous = PreviousBeat;
                    if (previous != null && previous.GraceType == GraceType.BendGrace)
                    {
                        PlaybackDuration = previous.PlaybackDuration;
                    }
                    else
                    {
                        while (previous != null && previous.GraceType == GraceType.OnBeat)
                        {
                            // if the previous beat is a on-beat grace it steals the duration from this beat
                            PlaybackDuration -= previous.PlaybackDuration;
                            previous = previous.PreviousBeat;
                        }
                    }

                    break;
            }


            //// It can happen that the first beat of the next bar shifts into this
            //// beat due to before-beat grace. In this case we need to
            //// reduce the duration of this beat.
            //// Within the same bar the start of the next beat is always directly after the current.

            //if (NextBeat != null && NextBeat.Voice.Bar != Voice.Bar)
            //{
            //    var next = NextBeat;
            //    while (next != null && next.GraceType == GraceType.BeforeBeat)
            //    {
            //        PlaybackDuration -= next.CalculateDuration();
            //        next = next.NextBeat;
            //    }
            //}
        }

        internal void FinishTuplet()
        {
            var previousBeat = PreviousBeat;
            var currentTupletGroup = previousBeat != null ? previousBeat.TupletGroup : null;

            if (HasTuplet || GraceType != GraceType.None && currentTupletGroup != null)
            {
                if (previousBeat == null || currentTupletGroup == null || !currentTupletGroup.Check(this))
                {
                    currentTupletGroup = new TupletGroup(Voice);
                    currentTupletGroup.Check(this);
                }

                TupletGroup = currentTupletGroup;
            }
        }

        internal void Finish(Settings settings)
        {
            var displayMode = settings == null ? NotationMode.GuitarPro : settings.Notation.NotationMode;
            var isGradual = Text == "grad" || Text == "grad.";
            if (isGradual && displayMode == NotationMode.SongBook)
            {
                Text = "";
            }

            var needCopyBeatForBend = false;
            MinNote = null;
            MaxNote = null;
            MinStringNote = null;
            MaxStringNote = null;

            var visibleNotes = 0;
            var isEffectSlurBeat = false;

            for (int i = 0, j = Notes.Count; i < j; i++)
            {
                var note = Notes[i];
                note.Finish(settings);
                if (note.IsLetRing)
                {
                    IsLetRing = true;
                }

                if (note.IsPalmMute)
                {
                    IsPalmMute = true;
                }

                if (displayMode == NotationMode.SongBook && note.HasBend && GraceType != GraceType.BendGrace)
                {
                    if (!note.IsTieOrigin)
                    {
                        switch (note.BendType)
                        {
                            case BendType.Bend:
                            case BendType.PrebendRelease:
                            case BendType.PrebendBend:
                                needCopyBeatForBend = true;
                                break;
                        }
                    }

                    if (isGradual || note.BendStyle == BendStyle.Gradual)
                    {
                        isGradual = true;
                        note.BendStyle = BendStyle.Gradual;
                        needCopyBeatForBend = false;
                    }
                    else
                    {
                        note.BendStyle = BendStyle.Fast;
                    }
                }

                if (note.IsVisible)
                {
                    visibleNotes++;
                    if (MinNote == null || note.RealValue < MinNote.RealValue)
                    {
                        MinNote = note;
                    }

                    if (MaxNote == null || note.RealValue > MaxNote.RealValue)
                    {
                        MaxNote = note;
                    }

                    if (MinStringNote == null || note.String < MinStringNote.String)
                    {
                        MinStringNote = note;
                    }

                    if (MaxStringNote == null || note.String > MaxStringNote.String)
                    {
                        MaxStringNote = note;
                    }

                    if (note.HasEffectSlur)
                    {
                        isEffectSlurBeat = true;
                    }
                }
            }

            if (isEffectSlurBeat)
            {
                if (EffectSlurOrigin != null)
                {
                    EffectSlurOrigin.EffectSlurDestination = NextBeat;
                    EffectSlurOrigin.EffectSlurDestination.EffectSlurOrigin = EffectSlurOrigin;
                    EffectSlurOrigin = null;
                }
                else
                {
                    IsEffectSlurOrigin = true;
                    EffectSlurDestination = NextBeat;
                    EffectSlurDestination.EffectSlurOrigin = this;
                }
            }

            if (Notes.Count > 0 && visibleNotes == 0)
            {
                IsEmpty = true;
            }

            // we need to clean al letring/palmmute flags for rests
            // in case the effect is not continued on this beat
            if (!IsRest && (!IsLetRing || !IsPalmMute))
            {
                var currentBeat = PreviousBeat;
                while (currentBeat != null && currentBeat.IsRest)
                {
                    if (!IsLetRing)
                    {
                        currentBeat.IsLetRing = false;
                    }

                    if (!IsPalmMute)
                    {
                        currentBeat.IsPalmMute = false;
                    }

                    currentBeat = currentBeat.PreviousBeat;
                }
            }
            // if beat is a rest implicitely take over letring/palmmute
            // from the previous beat gets cleaned later in case we flagged it wrong.
            else if (IsRest && PreviousBeat != null && settings != null &&
                     settings.Notation.NotationMode == NotationMode.GuitarPro)
            {
                if (PreviousBeat.IsLetRing)
                {
                    IsLetRing = true;
                }

                if (PreviousBeat.IsPalmMute)
                {
                    IsPalmMute = true;
                }
            }


            // try to detect what kind of bend was used and cleans unneeded points if required
            // Guitar Pro 6 and above (gpif.xml) uses exactly 4 points to define all whammys
            if (WhammyBarPoints.Count > 0 && WhammyBarType == WhammyType.Custom)
            {
                if (displayMode == NotationMode.SongBook)
                {
                    WhammyStyle = isGradual ? BendStyle.Gradual : BendStyle.Fast;
                }

                var isContinuedWhammy = IsContinuedWhammy = PreviousBeat != null && PreviousBeat.HasWhammyBar;
                if (WhammyBarPoints.Count == 4)
                {
                    var origin = WhammyBarPoints[0];
                    var middle1 = WhammyBarPoints[1];
                    var middle2 = WhammyBarPoints[2];
                    var destination = WhammyBarPoints[3];

                    // the middle points are used for holds, anything else is a new feature we do not support yet
                    if (middle1.Value == middle2.Value)
                    {
                        // constant decrease or increase
                        if (origin.Value < middle1.Value && middle1.Value < destination.Value ||
                            origin.Value > middle1.Value && middle1.Value > destination.Value)
                        {
                            if (origin.Value != 0 && !isContinuedWhammy)
                            {
                                WhammyBarType = WhammyType.PrediveDive;
                            }
                            else
                            {
                                WhammyBarType = WhammyType.Dive;
                            }

                            WhammyBarPoints.RemoveAt(2);
                            WhammyBarPoints.RemoveAt(1);
                        }
                        // down-up or up-down
                        else if (origin.Value > middle1.Value && middle1.Value < destination.Value ||
                                 origin.Value < middle1.Value && middle1.Value > destination.Value)
                        {
                            WhammyBarType = WhammyType.Dip;
                            if (middle1.Offset == middle2.Offset || displayMode == NotationMode.SongBook)
                            {
                                WhammyBarPoints.RemoveAt(2);
                            }
                        }
                        else if (origin.Value == middle1.Value && middle1.Value == destination.Value)
                        {
                            if (origin.Value != 0 && !isContinuedWhammy)
                            {
                                WhammyBarType = WhammyType.Predive;
                            }
                            else
                            {
                                WhammyBarType = WhammyType.Hold;
                            }

                            WhammyBarPoints.RemoveAt(2);
                            WhammyBarPoints.RemoveAt(1);
                        }
                        else
                        {
                            Logger.Warning("Model", "Unsupported whammy type detected, fallback to custom");
                        }
                    }
                    else
                    {
                        Logger.Warning("Model", "Unsupported whammy type detected, fallback to custom");
                    }
                }
            }

            UpdateDurations();

            if (needCopyBeatForBend)
            {
                // if this beat is a simple bend convert it to a grace beat
                // and generate a placeholder beat with tied notes

                var cloneBeat = Clone();
                cloneBeat.Id = _globalBeatId++;
                for (int i = 0, j = cloneBeat.Notes.Count; i < j; i++)
                {
                    var cloneNote = cloneBeat.Notes[i];
                    // remove bend on cloned note
                    cloneNote.BendType = BendType.None;
                    cloneNote.MaxBendPoint = null;
                    cloneNote.BendPoints = new FastList<BendPoint>();
                    cloneNote.BendStyle = BendStyle.Default;
                    cloneNote.Id = Note.GlobalNoteId++;

                    // if the note has a bend which is continued on the next note
                    // we need to convert this note into a hold bend
                    var note = Notes[i];
                    if (note.HasBend && note.IsTieOrigin)
                    {
                        var tieDestination = Note.NextNoteOnSameLine(note);
                        if (tieDestination != null && tieDestination.HasBend)
                        {
                            cloneNote.BendType = BendType.Hold;
                            var lastPoint = note.BendPoints[note.BendPoints.Count - 1];
                            cloneNote.AddBendPoint(new BendPoint(0, lastPoint.Value));
                            cloneNote.AddBendPoint(new BendPoint(BendPoint.MaxPosition, lastPoint.Value));
                        }
                    }

                    // mark as tied note
                    cloneNote.IsTieDestination = true;
                }

                GraceType = GraceType.BendGrace;
                UpdateDurations();

                Voice.InsertBeat(this, cloneBeat);
            }

            Fermata = Voice.Bar.MasterBar.GetFermata(this);
        }

        /// <summary>
        /// Checks whether the current beat is timewise before the given beat.
        /// </summary>
        /// <param name="beat"></param>
        /// <returns></returns>
        internal bool IsBefore(Beat beat)
        {
            return Voice.Bar.Index < beat.Voice.Bar.Index ||
                   beat.Voice.Bar.Index == Voice.Bar.Index && Index < beat.Index;
        }

        /// <summary>
        /// Checks whether the current beat is timewise after the given beat.
        /// </summary>
        /// <param name="beat"></param>
        /// <returns></returns>
        internal bool IsAfter(Beat beat)
        {
            return Voice.Bar.Index > beat.Voice.Bar.Index ||
                   beat.Voice.Bar.Index == Voice.Bar.Index && Index > beat.Index;
        }

        internal bool HasNoteOnString(int noteString)
        {
            return NoteStringLookup.ContainsKey(noteString);
        }

        internal Note GetNoteWithRealValue(int noteRealValue)
        {
            if (NoteValueLookup.ContainsKey(noteRealValue))
            {
                return NoteValueLookup[noteRealValue];
            }

            return null;
        }
    }
}
