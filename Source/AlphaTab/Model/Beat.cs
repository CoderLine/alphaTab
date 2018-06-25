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

using AlphaTab.Audio;
using AlphaTab.Collections;
using AlphaTab.Util;

namespace AlphaTab.Model
{
    /// <summary>
    /// Lists all types of whammy bars
    /// </summary>
    public enum WhammyType
    {
        /// <summary>
        /// No whammy at all
        /// </summary>
        None,
        /// <summary>
        /// Individual points define the whammy in a flexible manner. 
        /// This system was mainly used in Guitar Pro 3-5
        /// </summary>
        Custom,
        /// <summary>
        /// Simple dive to a lower or higher note.
        /// </summary>
        Dive,
        /// <summary>
        /// A dive to a lower or higher note and releasing it back to normal. 
        /// </summary>
        Dip,
        /// <summary>
        /// Continue to hold the whammy at the position from a previous whammy. 
        /// </summary>
        Hold,
        /// <summary>
        /// Dive to a lower or higher note before playing it. 
        /// </summary>
        Predive,
        /// <summary>
        /// Dive to a lower or higher note before playing it, then change to another
        /// note. 
        /// </summary>
        PrediveDive
    }

    /// <summary>
    /// A beat is a single block within a bar. A beat is a combination
    /// of several notes played at the same time. 
    /// </summary>
    public class Beat
    {
        public const int WhammyBarMaxPosition = 60;
        public const int WhammyBarMaxValue = 24;

        /// <summary>
        /// This is a global counter for all beats. We use it 
        /// at several locations for lookup tables. 
        /// </summary>
        private static int GlobalBeatId = 0;

        public Beat PreviousBeat { get; set; }
        public Beat NextBeat { get; set; }
        public int Id { get; set; }
        public int Index { get; set; }
        public bool IsLastOfVoice => Index == Voice.Beats.Count - 1;

        public Voice Voice { get; set; }
        public FastList<Note> Notes { get; set; }
        public FastDictionary<int, Note> NoteStringLookup { get; set; }
        public bool IsEmpty { get; set; }
        public BendStyle WhammyStyle { get; set; }

        public Ottavia Ottava { get; set; }

        public Fermata Fermata { get; set; }

        public bool IsLegatoOrigin { get; set; }
        public bool IsLegatoDestination
        {
            get { return PreviousBeat != null && PreviousBeat.IsLegatoOrigin; }
        }

        private Note _minNote;

        public Note MinNote
        {
            get
            {
                if (_minNote == null)
                {
                    RefreshNotes();
                }
                return _minNote;
            }
        }

        private Note _maxNote;

        public Note MaxNote
        {
            get
            {
                if (_maxNote == null)
                {
                    RefreshNotes();
                }
                return _maxNote;
            }
        }

        private Note _maxStringNote;

        public Note MaxStringNote
        {
            get
            {
                if (_maxStringNote == null)
                {
                    RefreshNotes();
                }
                return _maxStringNote;
            }
        }

        private Note _minStringNote;

        public Note MinStringNote
        {
            get
            {
                if (_minStringNote == null)
                {
                    RefreshNotes();
                }
                return _minStringNote;
            }
        }

        public Duration Duration { get; set; }

        public bool IsRest
        {
            get
            {
                return Notes.Count == 0;
            }
        }

        public bool IsLetRing { get; set; }
        public bool IsPalmMute { get; set; }

        public FastList<Automation> Automations { get; set; }

        public int Dots { get; set; }
        public bool FadeIn { get; set; }
        public string[] Lyrics { get; set; }
        public bool Pop { get; set; }
        public bool HasRasgueado { get; set; }
        public bool Slap { get; set; }
        public bool Tap { get; set; }
        public string Text { get; set; }

        public BrushType BrushType { get; set; }
        public int BrushDuration { get; set; }

        public int TupletDenominator { get; set; }
        public int TupletNumerator { get; set; }

        public bool HasTuplet
        {
            get
            {
                return !(TupletDenominator == -1 && TupletNumerator == -1) &&
                       !(TupletDenominator == 1 && TupletNumerator == 1);
            }
        }

        public bool IsContinuedWhammy { get; set; }
        public WhammyType WhammyBarType { get; set; }
        public FastList<BendPoint> WhammyBarPoints { get; set; }
        public BendPoint MaxWhammyPoint { get; set; }
        public BendPoint MinWhammyPoint { get; set; }

        public bool HasWhammyBar
        {
            get { return WhammyBarType != WhammyType.None; }
        }

        public VibratoType Vibrato { get; set; }

        public string ChordId { get; set; }
        public bool HasChord
        {
            get { return ChordId != null; }
        }

        public Chord Chord
        {
            get
            {
                return Voice.Bar.Staff.Chords[ChordId];
            }
        }

        public GraceType GraceType { get; set; }
        public PickStrokeType PickStroke { get; set; }

        public bool IsTremolo
        {
            get { return TremoloSpeed != null; }
        }

        public Duration? TremoloSpeed { get; set; }
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

        public int DisplayDuration { get; set; }
        public int PlaybackDuration { get; set; }

        public int AbsoluteDisplayStart
        {
            get { return Voice.Bar.MasterBar.Start + DisplayStart; }
        }

        public int AbsolutePlaybackStart
        {
            get { return Voice.Bar.MasterBar.Start + PlaybackStart; }
        }

        public DynamicValue Dynamic { get; set; }

        public bool InvertBeamDirection { get; set; }

        public Beat()
        {
            Id = GlobalBeatId++;
            WhammyBarType = WhammyType.None;
            WhammyBarPoints = new FastList<BendPoint>();
            Notes = new FastList<Note>();
            BrushType = BrushType.None;
            Vibrato = VibratoType.None;
            GraceType = GraceType.None;
            PickStroke = PickStrokeType.None;
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
            Dynamic = DynamicValue.F;
            Crescendo = CrescendoType.None;
            InvertBeamDirection = false;
            Ottava = Ottavia.Regular;
            NoteStringLookup = new FastDictionary<int, Note>();
            WhammyStyle = BendStyle.Default;
        }

        public static void CopyTo(Beat src, Beat dst)
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
                for (int i = 0; i < src.Lyrics.Length; i++)
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
            dst.Dynamic = src.Dynamic;
            dst.IsLegatoOrigin = src.IsLegatoOrigin;
            dst.InvertBeamDirection = src.InvertBeamDirection;
            dst.WhammyBarType = src.WhammyBarType;
            dst.IsContinuedWhammy = src.IsContinuedWhammy;
            dst.Ottava = src.Ottava;
            dst.WhammyStyle = src.WhammyStyle;
        }

        public Beat Clone()
        {
            var beat = new Beat();
            var id = beat.Id;
            for (int i = 0, j = WhammyBarPoints.Count; i < j; i++)
            {
                beat.AddWhammyBarPoint(WhammyBarPoints[i].Clone());
            }
            for (int i = 0, j = Notes.Count; i < j; i++)
            {
                beat.AddNote(Notes[i].Clone());
            }
            CopyTo(this, beat);
            for (int i = 0, j = Automations.Count; i < j; i++)
            {
                beat.Automations.Add(Automations[i].Clone());
            }
            beat.Id = id;
            return beat;
        }

        public void AddWhammyBarPoint(BendPoint point)
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

        public void RemoveWhammyBarPoint(int index)
        {
            // check index
            if (index < 0 || index >= WhammyBarPoints.Count) return;

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

        public void AddNote(Note note)
        {
            note.Beat = this;
            note.Index = Notes.Count;
            Notes.Add(note);
            if (note.IsStringed)
            {
                NoteStringLookup[note.String] = note;
            }
        }

        public void RemoveNote(Note note)
        {
            var index = Notes.IndexOf(note);
            if (index >= 0)
            {
                Notes.RemoveAt(index);
            }

            if (note == _minNote || note == _maxNote || note == _minStringNote || note == _maxStringNote)
            {
                RefreshNotes();
            }
        }

        public void RefreshNotes()
        {
            for (int i = 0, j = Notes.Count; i < j; i++)
            {
                var note = Notes[i];
                if (_minNote == null || note.RealValue < _minNote.RealValue)
                {
                    _minNote = note;
                }
                if (_maxNote == null || note.RealValue > _maxNote.RealValue)
                {
                    _maxNote = note;
                }
                if (_minStringNote == null || note.String < _minStringNote.String)
                {
                    _minStringNote = note;
                }
                if (_maxStringNote == null || note.String > _maxStringNote.String)
                {
                    _maxStringNote = note;
                }
            }
        }

        public Automation GetAutomation(AutomationType type)
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

        public Note GetNoteOnString(int @string)
        {
            if (NoteStringLookup.ContainsKey(@string))
            {
                return NoteStringLookup[@string];
            }
            return null;
        }

        public void Finish(Settings settings)
        {
            // start
            if (Index == 0)
            {
                DisplayStart = 0;
                PlaybackStart = 0;
            }
            else
            {
                DisplayStart = PreviousBeat.DisplayStart + PreviousBeat.DisplayDuration;
                PlaybackStart = PreviousBeat.PlaybackStart + PreviousBeat.PlaybackDuration;
            }
            
            // if the previous beat is a bend grace it covers
            // also this beat fully. 
            if (PreviousBeat != null && PreviousBeat.GraceType == GraceType.BendGrace)
            {
                PlaybackDuration = 0;
            }
            else
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
                DisplayDuration = ticks;
                PlaybackDuration = ticks;

                // if the previous beat is a on-beat grace it steals the duration from this beat
                if (PreviousBeat != null && PreviousBeat.GraceType == GraceType.OnBeat)
                {
                    PlaybackDuration -= PreviousBeat.PlaybackDuration;
                }

                // It can happen that the first beat of the next bar shifts into this
                // beat due to before-beat grace. In this case we need to 
                // reduce the duration of this beat. 
                // Within the same bar the start of the next beat is always directly after the current. 
                if (NextBeat != null && NextBeat.Voice.Bar != Voice.Bar)
                {
                    var thisStart = AbsolutePlaybackStart;
                    var end = thisStart + ticks;
                    // we cannot use AbsoluteStart yet as the next bar might not have it's actual start time. (e.g. during model finish)
                    var nextStart = Voice.Bar.MasterBar.Start + Voice.Bar.MasterBar.CalculateDuration() +
                                    NextBeat.PlaybackStart;
                    if (nextStart < end)
                    {
                        PlaybackDuration = nextStart - thisStart;
                    }
                }
            }

            var displayMode = settings == null ? DisplayMode.GuitarPro : settings.DisplayMode;
            var isGradual = Text == "grad" || Text == "grad.";
            if (isGradual && displayMode == DisplayMode.SongBook)
            {
                Text = "";
            }

            var needCopyBeatForBend = false;
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
                if (displayMode == DisplayMode.SongBook && note.HasBend)
                {
                    if (note.BendType == BendType.Bend && !note.IsTieOrigin)
                    {
                        needCopyBeatForBend = true;
                    }

                    if (isGradual)
                    {
                        note.BendStyle = BendStyle.Gradual;
                        needCopyBeatForBend = false;
                    }
                    else
                    {
                        note.BendStyle = BendStyle.Fast;
                    }
                }
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
            else if (IsRest && PreviousBeat != null)
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
                if (displayMode == DisplayMode.SongBook)
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
                            if (middle1.Offset == middle2.Offset)
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

            if (needCopyBeatForBend)
            {
                // if this beat is a simple bend convert it to a grace beat 
                // and generate a placeholder beat with tied notes

                var cloneBeat = Clone();
                for (int i = 0, j = cloneBeat.Notes.Count; i < j; i++)
                {
                    var cloneNote = cloneBeat.Notes[i];

                    // remove bend on cloned note
                    cloneNote.BendType = BendType.None;
                    cloneNote.MaxBendPoint = null;
                    cloneNote.BendPoints = new FastList<BendPoint>();
                    cloneNote.BendStyle = BendStyle.Default;

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
                

                Voice.InsertBeat(this, cloneBeat);
            }

            Fermata = Voice.Bar.MasterBar.GetFermata(this);
        }

        /// <summary>
        /// Checks whether the current beat is timewise before the given beat. 
        /// </summary>
        /// <param name="beat"></param>
        /// <returns></returns>
        public bool IsBefore(Beat beat)
        {
            return Voice.Bar.Index < beat.Voice.Bar.Index ||
                   (beat.Voice.Bar.Index == Voice.Bar.Index && Index < beat.Index);
        }

        /// <summary>
        /// Checks whether the current beat is timewise after the given beat. 
        /// </summary>
        /// <param name="beat"></param>
        /// <returns></returns>
        public bool IsAfter(Beat beat)
        {
            return Voice.Bar.Index > beat.Voice.Bar.Index ||
                   (beat.Voice.Bar.Index == Voice.Bar.Index && Index > beat.Index);
        }

        public bool HasNoteOnString(int noteString)
        {
            return NoteStringLookup.ContainsKey(noteString);
        }
    }
}