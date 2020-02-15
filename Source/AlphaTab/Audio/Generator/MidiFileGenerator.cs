﻿using System;
using AlphaTab.Audio.Synth.Midi.Event;
using AlphaTab.Collections;
using AlphaTab.Model;
using AlphaTab.Util;

namespace AlphaTab.Audio.Generator
{
    internal class MidiNoteDuration
    {
        public int NoteOnly { get; set; }
        public int UntilTieEnd { get; set; }
        public int LetRingEnd { get; set; }
    }

    /// <summary>
    /// This generator creates a midi file using a score.
    /// </summary>
    public class MidiFileGenerator
    {
        private readonly Score _score;
        private readonly Settings _settings;
        private readonly IMidiFileHandler _handler;
        private int _currentTempo;
        private BeatTickLookup _currentBarRepeatLookup;

        private const int DefaultDurationDead = 30;
        private const int DefaultDurationPalmMute = 80;

        /// <summary>
        /// Gets a lookup object which can be used to quickly find beats and bars
        /// at a given midi tick position.
        /// </summary>
        public MidiTickLookup TickLookup { get; }

        /// <summary>
        /// Initializes a new instance of the <see cref="MidiFileGenerator"/> class.
        /// </summary>
        /// <param name="score">The score for which the midi file should be generated.</param>
        /// <param name="settings">The settings ot use for generation.</param>
        /// <param name="handler">The handler that should be used for generating midi events.</param>
        public MidiFileGenerator(Score score, Settings settings, IMidiFileHandler handler)
        {
            _score = score;
            _settings = settings == null ? new Settings() : settings;
            _currentTempo = _score.Tempo;
            _handler = handler;
            TickLookup = new MidiTickLookup();
        }

        /// <summary>
        /// Starts the generation of the midi file.
        /// </summary>
        public void Generate()
        {
            // initialize tracks
            for (int i = 0, j = _score.Tracks.Count; i < j; i++)
            {
                GenerateTrack(_score.Tracks[i]);
            }

            Logger.Info("Midi", "Begin midi generation");
            var controller = new MidiPlaybackController(_score);
            MasterBar previousMasterBar = null; // store the previous played bar for repeats
            while (!controller.Finished)
            {
                var index = controller.Index;
                var bar = _score.MasterBars[index];
                var currentTick = controller.CurrentTick;
                controller.ProcessCurrent();
                if (controller.ShouldPlay)
                {
                    GenerateMasterBar(bar, previousMasterBar, currentTick);
                    for (int i = 0, j = _score.Tracks.Count; i < j; i++)
                    {
                        var track = _score.Tracks[i];
                        for (int k = 0, l = track.Staves.Count; k < l; k++)
                        {
                            var staff = track.Staves[k];
                            if (index < staff.Bars.Count)
                            {
                                GenerateBar(staff.Bars[index], currentTick);
                            }
                        }
                    }
                }

                controller.MoveNext();
                previousMasterBar = bar;
            }

            for (int i = 0, j = _score.Tracks.Count; i < j; i++)
            {
                _handler.FinishTrack(_score.Tracks[i].Index, controller.CurrentTick);
            }

            TickLookup.Finish();
            Logger.Info("Midi", "Midi generation done");
        }

        #region Track

        private void GenerateTrack(Track track)
        {
            // channel
            GenerateChannel(track, (byte)track.PlaybackInfo.PrimaryChannel, track.PlaybackInfo);
            if (track.PlaybackInfo.PrimaryChannel != track.PlaybackInfo.SecondaryChannel)
            {
                GenerateChannel(track, (byte)track.PlaybackInfo.SecondaryChannel, track.PlaybackInfo);
            }
        }

        private void GenerateChannel(Track track, byte channel, PlaybackInformation playbackInfo)
        {
            var volume = ToChannelShort(playbackInfo.Volume);
            var balance = ToChannelShort(playbackInfo.Balance);
            _handler.AddControlChange(track.Index, 0, channel, (byte)ControllerType.VolumeCoarse, (byte)volume);
            _handler.AddControlChange(track.Index, 0, channel, (byte)ControllerType.PanCoarse, (byte)balance);
            _handler.AddControlChange(track.Index, 0, channel, (byte)ControllerType.ExpressionControllerCoarse, 127);

            // set parameter that is being updated (0) -> PitchBendRangeCoarse
            _handler.AddControlChange(track.Index, 0, channel, (byte)ControllerType.RegisteredParameterFine, 0);
            _handler.AddControlChange(track.Index, 0, channel, (byte)ControllerType.RegisteredParameterCourse, 0);

            // Set PitchBendRangeCoarse to 12
            _handler.AddControlChange(track.Index, 0, channel, (byte)ControllerType.DataEntryFine, 0);
            _handler.AddControlChange(track.Index, 0, channel, (byte)ControllerType.DataEntryCoarse, 12);

            _handler.AddProgramChange(track.Index, 0, channel, (byte)playbackInfo.Program);
        }

        private static int ToChannelShort(int data)
        {
            var value = Math.Max(-32768, Math.Min(32767, data * 8 - 1));
            return Math.Max(value, -1) + 1;
        }

        #endregion

        #region MasterBar

        private void GenerateMasterBar(MasterBar masterBar, MasterBar previousMasterBar, int currentTick)
        {
            // time signature
            if (previousMasterBar == null ||
                previousMasterBar.TimeSignatureDenominator != masterBar.TimeSignatureDenominator ||
                previousMasterBar.TimeSignatureNumerator != masterBar.TimeSignatureNumerator)
            {
                _handler.AddTimeSignature(currentTick,
                    masterBar.TimeSignatureNumerator,
                    masterBar.TimeSignatureDenominator);
            }

            // tempo
            if (previousMasterBar == null)
            {
                _handler.AddTempo(currentTick, masterBar.Score.Tempo);
                _currentTempo = masterBar.Score.Tempo;
            }
            else if (masterBar.TempoAutomation != null)
            {
                _handler.AddTempo(currentTick, (int)masterBar.TempoAutomation.Value);
                _currentTempo = (int)masterBar.TempoAutomation.Value;
            }

            var masterBarLookup = new MasterBarTickLookup();
            masterBarLookup.MasterBar = masterBar;
            masterBarLookup.Start = currentTick;
            masterBarLookup.Tempo = _currentTempo;
            masterBarLookup.End = masterBarLookup.Start + masterBar.CalculateDuration();
            TickLookup.AddMasterBar(masterBarLookup);
        }

        #endregion

        #region Bar -> Voice -> Beat -> Automations/Rests/Notes

        private void GenerateBar(Bar bar, int barStartTick)
        {
            var playbackBar = GetPlaybackBar(bar);
            _currentBarRepeatLookup = null;

            for (int i = 0, j = playbackBar.Voices.Count; i < j; i++)
            {
                GenerateVoice(playbackBar.Voices[i], barStartTick, bar);
            }
        }

        private Bar GetPlaybackBar(Bar bar)
        {
            switch (bar.SimileMark)
            {
                case SimileMark.Simple:
                    if (bar.PreviousBar != null)
                    {
                        bar = GetPlaybackBar(bar.PreviousBar);
                    }

                    break;
                case SimileMark.FirstOfDouble:
                    if (bar.PreviousBar != null && bar.PreviousBar.PreviousBar != null)
                    {
                        bar = GetPlaybackBar(bar.PreviousBar.PreviousBar);
                    }

                    break;
                case SimileMark.SecondOfDouble:
                    if (bar.PreviousBar != null && bar.PreviousBar.PreviousBar != null)
                    {
                        bar = GetPlaybackBar(bar.PreviousBar.PreviousBar);
                    }

                    break;
            }

            return bar;
        }

        private void GenerateVoice(Voice voice, int barStartTick, Bar realBar)
        {
            if (voice.IsEmpty && (!voice.Bar.IsEmpty || voice.Index != 0))
            {
                return;
            }

            for (int i = 0, j = voice.Beats.Count; i < j; i++)
            {
                GenerateBeat(voice.Beats[i], barStartTick, realBar);
            }
        }

        private TripletFeelDurations _currentTripletFeel;

        private void GenerateBeat(Beat beat, int barStartTick, Bar realBar)
        {
            // TODO: take care of tripletfeel
            var beatStart = beat.PlaybackStart;
            var audioDuration = beat.PlaybackDuration;

            if (beat.Voice.Bar.IsEmpty)
            {
                audioDuration = beat.Voice.Bar.MasterBar.CalculateDuration();
            }
            else if (beat.Voice.Bar.MasterBar.TripletFeel != TripletFeel.NoTripletFeel && _settings.Player.PlayTripletFeel)
            {
                if (_currentTripletFeel != null)
                {
                    beatStart -= _currentTripletFeel.SecondBeatStartOffset;
                    audioDuration = _currentTripletFeel.SecondBeatDuration;
                    _currentTripletFeel = null;
                }
                else
                {
                    _currentTripletFeel = CalculateTripletFeelInfo(beatStart, audioDuration, beat);
                    if (_currentTripletFeel != null)
                    {
                        audioDuration = _currentTripletFeel.FirstBeatDuration;
                    }
                }
            }


            var beatLookup = new BeatTickLookup();
            beatLookup.Start = barStartTick + beatStart;
            var realTickOffset = beat.NextBeat == null
                ? audioDuration
                : beat.NextBeat.AbsolutePlaybackStart - beat.AbsolutePlaybackStart;
            beatLookup.End = barStartTick + beatStart;
            beatLookup.HighlightBeat(beat);

            beatLookup.End += realTickOffset > audioDuration ? realTickOffset : audioDuration;

            // in case of normal playback register playback
            if (realBar == beat.Voice.Bar)
            {
                beatLookup.Beat = beat;
                TickLookup.AddBeat(beatLookup);
            }
            // in case of bar repeats register empty beat
            else
            {
                beatLookup.IsEmptyBar = true;
                beatLookup.Beat = realBar.Voices[0].Beats[0];
                if (_currentBarRepeatLookup == null)
                {
                    _currentBarRepeatLookup = beatLookup;
                    TickLookup.AddBeat(_currentBarRepeatLookup);
                }
                else
                {
                    _currentBarRepeatLookup.End = beatLookup.End;
                }
            }

            var track = beat.Voice.Bar.Staff.Track;

            for (int i = 0, j = beat.Automations.Count; i < j; i++)
            {
                GenerateAutomation(beat, beat.Automations[i], barStartTick);
            }

            if (beat.IsRest)
            {
                _handler.AddRest(track.Index, barStartTick + beatStart, track.PlaybackInfo.PrimaryChannel);
            }
            else
            {
                var brushInfo = GetBrushInfo(beat);

                for (int i = 0, j = beat.Notes.Count; i < j; i++)
                {
                    var n = beat.Notes[i];

                    GenerateNote(n, barStartTick + beatStart, audioDuration, brushInfo);
                }
            }

            if (beat.Vibrato != VibratoType.None)
            {
                var phaseLength = 240;
                var bendAmplitude = 3;
                switch (beat.Vibrato)
                {
                    case VibratoType.Slight:
                        phaseLength = _settings.Player.Vibrato.BeatSlightLength;
                        bendAmplitude = _settings.Player.Vibrato.BeatSlightAmplitude;
                        break;
                    case VibratoType.Wide:
                        phaseLength = _settings.Player.Vibrato.BeatWideLength;
                        bendAmplitude = _settings.Player.Vibrato.BeatWideAmplitude;
                        break;
                }

                GenerateVibratorWithParams(beat.Voice.Bar.Staff.Track,
                    barStartTick + beatStart,
                    beat.PlaybackDuration,
                    phaseLength,
                    bendAmplitude,
                    track.PlaybackInfo.SecondaryChannel);
            }
        }

        private class TripletFeelDurations
        {
            public int FirstBeatDuration { get; set; }
            public int SecondBeatStartOffset { get; set; }
            public int SecondBeatDuration { get; set; }
        }

        private TripletFeelDurations CalculateTripletFeelInfo(int beatStart, int audioDuration, Beat beat)
        {
            Duration initialDuration;
            switch (beat.Voice.Bar.MasterBar.TripletFeel)
            {
                case TripletFeel.Triplet8th:
                case TripletFeel.Dotted8th:
                case TripletFeel.Scottish8th:
                    initialDuration = Duration.Eighth;
                    break;
                case TripletFeel.Triplet16th:
                case TripletFeel.Dotted16th:
                case TripletFeel.Scottish16th:
                    initialDuration = Duration.Sixteenth;
                    break;
                default:
                    // not possible
                    return null;
            }

            var interval = initialDuration.ToTicks();

            // it must be a plain note with the expected duration
            // without dots, triplets, grace notes etc.
            if (audioDuration != interval)
            {
                return null;
            }

            // check if the beat is aligned in respect to the duration
            // e.g. the eighth notes on a 4/4 time signature must start exactly on the following
            // times to get a triplet feel applied
            // 0 480 960 1440 1920 2400 2880 3360
            if ((beatStart % interval) != 0)
            {
                return null;
            }

            // ensure next beat matches spec
            if (beat.NextBeat == null || beat.NextBeat.Voice != beat.Voice || beat.PlaybackDuration != interval)
            {
                return null;
            }

            // looks like we have a triplet feel combination start here!
            var durations = new TripletFeelDurations();
            switch (beat.Voice.Bar.MasterBar.TripletFeel)
            {
                case TripletFeel.Triplet8th:
                    durations.FirstBeatDuration = MidiUtils.ApplyTuplet(Duration.Quarter.ToTicks(), 3, 2);
                    durations.SecondBeatDuration = MidiUtils.ApplyTuplet(Duration.Eighth.ToTicks(), 3, 2);
                    break;
                case TripletFeel.Dotted8th:
                    durations.FirstBeatDuration = MidiUtils.ApplyDot(Duration.Eighth.ToTicks(), false);
                    durations.SecondBeatDuration = Duration.Sixteenth.ToTicks();
                    break;
                case TripletFeel.Scottish8th:
                    durations.FirstBeatDuration = Duration.Sixteenth.ToTicks();
                    durations.SecondBeatDuration = MidiUtils.ApplyDot(Duration.Eighth.ToTicks(), false);
                    break;
                case TripletFeel.Triplet16th:
                    durations.FirstBeatDuration = MidiUtils.ApplyTuplet(Duration.Eighth.ToTicks(), 3, 2);
                    durations.SecondBeatDuration = MidiUtils.ApplyTuplet(Duration.Sixteenth.ToTicks(), 3, 2);
                    break;
                case TripletFeel.Dotted16th:
                    durations.FirstBeatDuration = MidiUtils.ApplyDot(Duration.Sixteenth.ToTicks(), false);
                    durations.SecondBeatDuration = Duration.ThirtySecond.ToTicks();
                    break;
                case TripletFeel.Scottish16th:
                    durations.FirstBeatDuration = Duration.ThirtySecond.ToTicks();
                    durations.SecondBeatDuration = MidiUtils.ApplyDot(Duration.Sixteenth.ToTicks(), false);
                    break;
            }

            // calculate the number of ticks the second beat can start earlier
            durations.SecondBeatStartOffset = audioDuration - durations.FirstBeatDuration;
            return durations;
        }

        private void GenerateNote(Note note, int beatStart, int beatDuration, int[] brushInfo)
        {
            var track = note.Beat.Voice.Bar.Staff.Track;
            var staff = note.Beat.Voice.Bar.Staff;
            var noteKey = note.RealValue;
            var brushOffset = note.IsStringed && note.String <= brushInfo.Length ? brushInfo[note.String - 1] : 0;
            var noteStart = beatStart + brushOffset;
            var noteDuration = GetNoteDuration(note, beatDuration);
            noteDuration.UntilTieEnd -= brushOffset;
            noteDuration.NoteOnly -= brushOffset;
            noteDuration.LetRingEnd -= brushOffset;
            var dynamicValue = GetDynamicValue(note);

            var channel = note.HasBend || note.Beat.HasWhammyBar || note.Beat.Vibrato != VibratoType.None
                ? track.PlaybackInfo.SecondaryChannel
                : track.PlaybackInfo.PrimaryChannel;

            var initialBend = DefaultBend;
            if (note.HasBend)
            {
                initialBend += (int)Math.Round(note.BendPoints[0].Value * DefaultBendSemitone);
            }
            else if (note.Beat.HasWhammyBar)
            {
                initialBend += (int)Math.Round(note.Beat.WhammyBarPoints[0].Value * DefaultBendSemitone);
            }
            else if (note.IsTieDestination)
            {
                initialBend = 0;
            }

            if (initialBend > 0)
            {
                _handler.AddBend(track.Index, noteStart, (byte)channel, initialBend);
            }

            //
            // Fade in
            if (note.Beat.FadeIn)
            {
                GenerateFadeIn(note, noteStart, noteDuration);
            }

            // TODO: grace notes?

            //
            // Trill
            if (note.IsTrill && !staff.IsPercussion)
            {
                GenerateTrill(note, noteStart, noteDuration, noteKey, dynamicValue, channel);
                // no further generation needed
                return;
            }

            //
            // Tremolo Picking
            if (note.Beat.IsTremolo)
            {
                GenerateTremoloPicking(note, noteStart, noteDuration, noteKey, dynamicValue, channel);
                // no further generation needed
                return;
            }

            //
            // All String Bending/Variation effects
            if (note.HasBend)
            {
                GenerateBend(note, noteStart, noteDuration, channel);
            }
            else if (note.Beat.HasWhammyBar && note.Index == 0)
            {
                GenerateWhammy(note.Beat, noteStart, noteDuration, channel);
            }
            else if (note.SlideInType != SlideInType.None || note.SlideOutType != SlideOutType.None)
            {
                // TODO GenerateSlide(note, noteStart, noteDuration, noteKey, dynamicValue, channel);
            }
            else if (note.Vibrato != VibratoType.None)
            {
                GenerateVibrato(note, noteStart, noteDuration, channel);
            }

            if (!note.IsTieDestination)
            {
                var noteSoundDuration = Math.Max(noteDuration.UntilTieEnd, noteDuration.LetRingEnd);
                _handler.AddNote(track.Index, noteStart, noteSoundDuration, (byte)noteKey, dynamicValue, (byte)channel);
            }
        }

        private MidiNoteDuration GetNoteDuration(Note note, int duration)
        {
            var durationWithEffects = new MidiNoteDuration();
            durationWithEffects.NoteOnly = duration;
            durationWithEffects.UntilTieEnd = duration;
            durationWithEffects.LetRingEnd = duration;

            if (note.IsDead)
            {
                durationWithEffects.NoteOnly = ApplyStaticDuration(DefaultDurationDead, duration);
                durationWithEffects.UntilTieEnd = durationWithEffects.NoteOnly;
                durationWithEffects.LetRingEnd = durationWithEffects.NoteOnly;
                return durationWithEffects;
            }

            if (note.IsPalmMute)
            {
                durationWithEffects.NoteOnly = ApplyStaticDuration(DefaultDurationPalmMute, duration);
                durationWithEffects.UntilTieEnd = durationWithEffects.NoteOnly;
                durationWithEffects.LetRingEnd = durationWithEffects.NoteOnly;
                return durationWithEffects;
            }

            if (note.IsStaccato)
            {
                durationWithEffects.NoteOnly = duration / 2;
                durationWithEffects.UntilTieEnd = durationWithEffects.NoteOnly;
                durationWithEffects.LetRingEnd = durationWithEffects.NoteOnly;
                return durationWithEffects;
            }

            if (note.IsTieOrigin)
            {
                var endNote = note.TieDestination;

                // for the initial start of the tie calculate absolute duration from start to end note
                if (endNote != null)
                {
                    if (!note.IsTieDestination)
                    {
                        var startTick = note.Beat.AbsolutePlaybackStart;
                        var tieDestinationDuration = GetNoteDuration(endNote, endNote.Beat.PlaybackDuration);
                        var endTick = endNote.Beat.AbsolutePlaybackStart + tieDestinationDuration.UntilTieEnd;
                        durationWithEffects.UntilTieEnd = endTick - startTick;
                    }
                    else
                    {
                        // for continuing ties, take the current duration + the one from the destination
                        // this branch will be entered as part of the recusion of the if branch
                        var tieDestinationDuration = GetNoteDuration(endNote, endNote.Beat.PlaybackDuration);
                        durationWithEffects.UntilTieEnd = duration + tieDestinationDuration.UntilTieEnd;
                    }
                }
            }

            if (note.IsLetRing && _settings.Notation.NotationMode == NotationMode.GuitarPro)
            {
                // LetRing ends when:
                // - rest
                var lastLetRingBeat = note.Beat;
                var letRingEnd = 0;
                var maxDuration = note.Beat.Voice.Bar.MasterBar.CalculateDuration();
                while (lastLetRingBeat.NextBeat != null)
                {
                    var next = lastLetRingBeat.NextBeat;
                    if (next.IsRest)
                    {
                        break;
                    }

                    // note on the same string
                    if (note.IsStringed && next.HasNoteOnString(note.String))
                    {
                        break;
                    }

                    lastLetRingBeat = lastLetRingBeat.NextBeat;

                    letRingEnd = lastLetRingBeat.AbsolutePlaybackStart - note.Beat.AbsolutePlaybackStart +
                                 lastLetRingBeat.PlaybackDuration;
                    if (letRingEnd > maxDuration)
                    {
                        letRingEnd = maxDuration;
                        break;
                    }
                }

                if (lastLetRingBeat == note.Beat)
                {
                    durationWithEffects.LetRingEnd = duration;
                }
                else
                {
                    durationWithEffects.LetRingEnd = letRingEnd;
                }
            }
            else
            {
                durationWithEffects.LetRingEnd = durationWithEffects.UntilTieEnd;
            }

            return durationWithEffects;
        }

        private int ApplyStaticDuration(int duration, int maximum)
        {
            var value = _currentTempo * duration / 60;
            return Math.Min(value, maximum);
        }

        private DynamicValue GetDynamicValue(Note note)
        {
            var dynamicValue = note.Dynamics;

            // more silent on hammer destination
            if (!note.Beat.Voice.Bar.Staff.IsPercussion && note.HammerPullOrigin != null)
            {
                dynamicValue--;
            }

            // more silent on ghost notes
            if (note.IsGhost)
            {
                dynamicValue--;
            }

            // louder on accent
            switch (note.Accentuated)
            {
                case AccentuationType.Normal:
                    dynamicValue++;
                    break;
                case AccentuationType.Heavy:
                    dynamicValue += 2;
                    break;
            }

            return dynamicValue;
        }

        #endregion

        #region Effect Generation

        private void GenerateFadeIn(Note note, int noteStart, MidiNoteDuration noteDuration)
        {
            var track = note.Beat.Voice.Bar.Staff.Track;
            var endVolume = ToChannelShort(track.PlaybackInfo.Volume);
            var volumeFactor = (float)endVolume / noteDuration.NoteOnly;

            var tickStep = 120;
            var steps = noteDuration.NoteOnly / tickStep;

            var endTick = noteStart + noteDuration.NoteOnly;
            for (var i = steps - 1; i >= 0; i--)
            {
                var tick = endTick - i * tickStep;
                var volume = (tick - noteStart) * volumeFactor;
                if (i == steps - 1)
                {
                    _handler.AddControlChange(track.Index,
                        noteStart,
                        (byte)track.PlaybackInfo.PrimaryChannel,
                        (byte)ControllerType.VolumeCoarse,
                        (byte)volume);
                    _handler.AddControlChange(track.Index,
                        noteStart,
                        (byte)track.PlaybackInfo.SecondaryChannel,
                        (byte)ControllerType.VolumeCoarse,
                        (byte)volume);
                }

                _handler.AddControlChange(track.Index,
                    tick,
                    (byte)track.PlaybackInfo.PrimaryChannel,
                    (byte)ControllerType.VolumeCoarse,
                    (byte)volume);
                _handler.AddControlChange(track.Index,
                    tick,
                    (byte)track.PlaybackInfo.SecondaryChannel,
                    (byte)ControllerType.VolumeCoarse,
                    (byte)volume);
            }
        }

        private void GenerateVibrato(Note note, int noteStart, MidiNoteDuration noteDuration, int channel)
        {
            int phaseLength;
            int bendAmplitude;

            switch (note.Vibrato)
            {
                case VibratoType.Slight:
                    phaseLength = _settings.Player.Vibrato.NoteSlightLength;
                    bendAmplitude = _settings.Player.Vibrato.NoteSlightAmplitude;
                    break;
                case VibratoType.Wide:
                    phaseLength = _settings.Player.Vibrato.NoteWideLength;
                    bendAmplitude = _settings.Player.Vibrato.NoteWideAmplitude;
                    break;
                default:
                    return;
            }

            var track = note.Beat.Voice.Bar.Staff.Track;

            GenerateVibratorWithParams(track, noteStart, noteDuration.NoteOnly, phaseLength, bendAmplitude, channel);
        }

        private void GenerateVibratorWithParams(
            Track track,
            int noteStart,
            int noteDuration,
            int phaseLength,
            int bendAmplitude,
            int channel)
        {
            const int resolution = 16;

            var phaseHalf = phaseLength / 2;
            // 1st Phase stays at bend 0,
            // then we have a sine wave with the given amplitude and phase length

            noteStart += phaseLength;
            var noteEnd = noteStart + noteDuration;

            while (noteStart < noteEnd)
            {
                var phase = 0;
                var phaseDuration = noteStart + phaseLength < noteEnd ? phaseLength : noteEnd - noteStart;
                while (phase < phaseDuration)
                {
                    var bend = bendAmplitude * Math.Sin(phase * Math.PI / phaseHalf);

                    _handler.AddBend(track.Index, noteStart + phase, (byte)channel, (int)(DefaultBend + bend));

                    phase += resolution;
                }

                noteStart += phaseLength;
            }
        }

        private const int DefaultBend = 0x20;
        private const float DefaultBendSemitone = 2.75f;

        private void GenerateBend(Note note, int noteStart, MidiNoteDuration noteDuration, int channel)
        {
            var bendPoints = note.BendPoints;
            var track = note.Beat.Voice.Bar.Staff.Track;

            // if bend is extended on next tied note, we directly bend to the final bend value
            int? finalBendValue = null;

            // Bends are spread across all tied notes unless they have a bend on their own.
            double duration;
            if (note.IsTieOrigin && _settings.Notation.ExtendBendArrowsOnTiedNotes)
            {
                var endNote = note;
                while (endNote.IsTieOrigin && !endNote.TieDestination.HasBend)
                {
                    endNote = endNote.TieDestination;
                }

                duration = endNote.Beat.AbsolutePlaybackStart - note.Beat.AbsolutePlaybackStart +
                           GetNoteDuration(endNote, endNote.Beat.PlaybackDuration).NoteOnly;
            }
            // if current note is a grace note with bend and tie, we can reach into next note
            else if (note.IsTieOrigin && note.Beat.GraceType != GraceType.None)
            {
                switch (note.TieDestination.BendType)
                {
                    case BendType.Bend:
                    case BendType.BendRelease:
                    case BendType.PrebendBend:
                        finalBendValue = note.TieDestination.BendPoints[1].Value;
                        break;
                    case BendType.Prebend:
                    case BendType.PrebendRelease:
                        finalBendValue = note.TieDestination.BendPoints[0].Value;
                        break;
                }

                duration = Math.Max(noteDuration.NoteOnly,
                    MidiUtils.MillisToTicks(_settings.Player.SongBookBendDuration, _currentTempo));
            }
            else
            {
                duration = noteDuration.NoteOnly;
            }

            // ensure prebends are slightly before the actual note.
            if (bendPoints[0].Value > 0 && !note.IsContinuedBend)
            {
                noteStart--;
            }

            var bendDuration = Math.Min(duration,
                MidiUtils.MillisToTicks(_settings.Player.SongBookBendDuration, _currentTempo));

            var playedBendPoints = new FastList<BendPoint>();
            switch (note.BendType)
            {
                case BendType.Custom:
                    playedBendPoints = bendPoints;
                    break;
                case BendType.Bend:
                case BendType.Release:
                    switch (note.BendStyle)
                    {
                        case BendStyle.Default:
                            playedBendPoints = bendPoints;
                            break;
                        case BendStyle.Gradual:
                            playedBendPoints.Add(new BendPoint(0, note.BendPoints[0].Value));
                            if (finalBendValue == null || finalBendValue.Value < note.BendPoints[1].Value)
                            {
                                finalBendValue = note.BendPoints[1].Value;
                            }

                            playedBendPoints.Add(new BendPoint(BendPoint.MaxPosition, finalBendValue.Value));
                            break;
                        case BendStyle.Fast:
                            if (finalBendValue == null || finalBendValue.Value < note.BendPoints[1].Value)
                            {
                                finalBendValue = note.BendPoints[1].Value;
                            }

                            if (note.Beat.GraceType == GraceType.BendGrace)
                            {
                                GenerateSongBookWhammyOrBend(noteStart,
                                    channel,
                                    duration,
                                    track,
                                    true,
                                    new[]
                                    {
                                        note.BendPoints[0].Value, finalBendValue.Value
                                    },
                                    bendDuration);
                            }
                            else
                            {
                                GenerateSongBookWhammyOrBend(noteStart,
                                    channel,
                                    duration,
                                    track,
                                    false,
                                    new[]
                                    {
                                        note.BendPoints[0].Value, finalBendValue.Value
                                    },
                                    bendDuration);
                            }

                            return;
                    }

                    break;
                case BendType.BendRelease:
                    switch (note.BendStyle)
                    {
                        case BendStyle.Default:
                            playedBendPoints = bendPoints;
                            break;
                        case BendStyle.Gradual:
                            playedBendPoints.Add(new BendPoint(0, note.BendPoints[0].Value));
                            playedBendPoints.Add(new BendPoint(BendPoint.MaxPosition / 2, note.BendPoints[1].Value));
                            playedBendPoints.Add(new BendPoint(BendPoint.MaxPosition, note.BendPoints[2].Value));
                            break;
                        case BendStyle.Fast:
                            GenerateSongBookWhammyOrBend(noteStart,
                                channel,
                                duration,
                                track,
                                false,
                                new[]
                                {
                                    note.BendPoints[0].Value, note.BendPoints[1].Value, note.BendPoints[2].Value
                                },
                                bendDuration);
                            return;
                    }

                    break;
                case BendType.Hold:
                    playedBendPoints = bendPoints;
                    break;
                case BendType.Prebend:
                    playedBendPoints = bendPoints;
                    break;
                case BendType.PrebendBend:
                    switch (note.BendStyle)
                    {
                        case BendStyle.Default:
                            playedBendPoints = bendPoints;
                            break;
                        case BendStyle.Gradual:
                            playedBendPoints.Add(new BendPoint(0, note.BendPoints[0].Value));
                            playedBendPoints.Add(new BendPoint(BendPoint.MaxPosition, note.BendPoints[1].Value));
                            break;
                        case BendStyle.Fast:
                            var preBendValue = DefaultBend + note.BendPoints[0].Value * DefaultBendSemitone;
                            _handler.AddBend(track.Index, noteStart, (byte)channel, (int)preBendValue);

                            if (finalBendValue == null || finalBendValue.Value < note.BendPoints[1].Value)
                            {
                                finalBendValue = note.BendPoints[1].Value;
                            }

                            GenerateSongBookWhammyOrBend(noteStart,
                                channel,
                                duration,
                                track,
                                false,
                                new[]
                                {
                                    note.BendPoints[0].Value, finalBendValue.Value
                                },
                                bendDuration);
                            return;
                    }

                    break;
                case BendType.PrebendRelease:
                    switch (note.BendStyle)
                    {
                        case BendStyle.Default:
                            playedBendPoints = bendPoints;
                            break;
                        case BendStyle.Gradual:
                            playedBendPoints.Add(new BendPoint(0, note.BendPoints[0].Value));
                            playedBendPoints.Add(new BendPoint(BendPoint.MaxPosition, note.BendPoints[1].Value));
                            break;
                        case BendStyle.Fast:
                            var preBendValue = DefaultBend + note.BendPoints[0].Value * DefaultBendSemitone;
                            _handler.AddBend(track.Index, noteStart, (byte)channel, (int)preBendValue);

                            GenerateSongBookWhammyOrBend(noteStart,
                                channel,
                                duration,
                                track,
                                false,
                                new[]
                                {
                                    note.BendPoints[0].Value, note.BendPoints[1].Value
                                },
                                bendDuration);
                            return;
                    }

                    break;
            }

            GenerateWhammyOrBend(noteStart, channel, duration, playedBendPoints, track);
        }

        private void GenerateSongBookWhammyOrBend(
            int noteStart,
            int channel,
            double duration,
            Track track,
            bool bendAtBeginning,
            int[] bendValues,
            double bendDuration)
        {
            var startTick = bendAtBeginning ? noteStart : noteStart + duration - bendDuration;
            var ticksBetweenPoints = bendDuration / (bendValues.Length - 1);

            for (var i = 0; i < bendValues.Length - 1; i++)
            {
                var currentBendValue = DefaultBend + bendValues[i] * DefaultBendSemitone;
                var nextBendValue = DefaultBend + bendValues[i + 1] * DefaultBendSemitone;

                var tick = startTick + ticksBetweenPoints * i;
                GenerateBendValues(tick, channel, track, ticksBetweenPoints, currentBendValue, nextBendValue);
            }
        }


        private void GenerateWhammy(Beat beat, int noteStart, MidiNoteDuration noteDuration, int channel)
        {
            var bendPoints = beat.WhammyBarPoints;
            var track = beat.Voice.Bar.Staff.Track;

            double duration = noteDuration.NoteOnly;

            // ensure prebends are slightly before the actual note.
            if (bendPoints[0].Value > 0 && !beat.IsContinuedWhammy)
            {
                noteStart--;
            }

            var playedBendPoints = new FastList<BendPoint>();
            switch (beat.WhammyBarType)
            {
                case WhammyType.Custom:
                    playedBendPoints = bendPoints;
                    break;
                case WhammyType.Dive:
                    switch (beat.WhammyStyle)
                    {
                        case BendStyle.Default:
                            playedBendPoints = bendPoints;
                            break;
                        case BendStyle.Gradual:
                            playedBendPoints.Add(new BendPoint(0, bendPoints[0].Value));
                            playedBendPoints.Add(new BendPoint(BendPoint.MaxPosition, bendPoints[1].Value));
                            break;
                        case BendStyle.Fast:
                            var whammyDuration = Math.Min(duration,
                                    MidiUtils.MillisToTicks(_settings.Player.SongBookBendDuration, _currentTempo));
                            GenerateSongBookWhammyOrBend(noteStart,
                                channel,
                                duration,
                                track,
                                false,
                                new[]
                                {
                                    bendPoints[0].Value, bendPoints[1].Value
                                },
                                whammyDuration);
                            return;
                    }

                    break;
                case WhammyType.Dip:
                    switch (beat.WhammyStyle)
                    {
                        case BendStyle.Default:
                            playedBendPoints = bendPoints;
                            break;
                        case BendStyle.Gradual:
                            playedBendPoints.Add(new BendPoint(0, bendPoints[0].Value));
                            playedBendPoints.Add(new BendPoint(BendPoint.MaxPosition / 2, bendPoints[1].Value));
                            playedBendPoints.Add(new BendPoint(BendPoint.MaxPosition, bendPoints[2].Value));
                            break;
                        case BendStyle.Fast:
                            var whammyDuration = Math.Min(duration,
                                MidiUtils.MillisToTicks(_settings.Player.SongBookDipDuration, _currentTempo));
                            GenerateSongBookWhammyOrBend(noteStart,
                                channel,
                                duration,
                                track,
                                true,
                                new[]
                                {
                                    bendPoints[0].Value, bendPoints[1].Value, bendPoints[2].Value
                                },
                                whammyDuration);
                            return;
                    }

                    break;
                case WhammyType.Hold:
                    playedBendPoints = bendPoints;
                    break;
                case WhammyType.Predive:
                    playedBendPoints = bendPoints;
                    break;
                case WhammyType.PrediveDive:
                    switch (beat.WhammyStyle)
                    {
                        case BendStyle.Default:
                            playedBendPoints = bendPoints;
                            break;
                        case BendStyle.Gradual:
                            playedBendPoints.Add(new BendPoint(0, bendPoints[0].Value));
                            playedBendPoints.Add(new BendPoint(BendPoint.MaxPosition / 2, bendPoints[0].Value));
                            playedBendPoints.Add(new BendPoint(BendPoint.MaxPosition, bendPoints[1].Value));
                            break;
                        case BendStyle.Fast:
                            var preDiveValue = DefaultBend + bendPoints[0].Value * DefaultBendSemitone;
                            _handler.AddBend(track.Index, noteStart, (byte)channel, (int)preDiveValue);

                            var whammyDuration = Math.Min(duration,
                                MidiUtils.MillisToTicks(_settings.Player.SongBookBendDuration, _currentTempo));
                            GenerateSongBookWhammyOrBend(noteStart,
                                channel,
                                duration,
                                track,
                                false,
                                new[]
                                {
                                    bendPoints[0].Value, bendPoints[1].Value
                                },
                                whammyDuration);
                            return;
                    }

                    break;
            }

            GenerateWhammyOrBend(noteStart, channel, duration, playedBendPoints, track);
        }

        private void GenerateWhammyOrBend(
            int noteStart,
            int channel,
            double duration,
            FastList<BendPoint> playedBendPoints,
            Track track)
        {
            var ticksPerPosition = duration / BendPoint.MaxPosition;
            for (var i = 0; i < playedBendPoints.Count - 1; i++)
            {
                var currentPoint = playedBendPoints[i];
                var nextPoint = playedBendPoints[i + 1];

                // calculate the midi pitchbend values start and end values
                var currentBendValue = DefaultBend + currentPoint.Value * DefaultBendSemitone;
                var nextBendValue = DefaultBend + nextPoint.Value * DefaultBendSemitone;

                // how many midi ticks do we have to spend between this point and the next one?
                var ticksBetweenPoints = ticksPerPosition * (nextPoint.Offset - currentPoint.Offset);

                // we will generate one pitchbend message for each value
                // for this we need to calculate how many ticks to offset per value
                var tick = noteStart + ticksPerPosition * currentPoint.Offset;

                GenerateBendValues(tick, channel, track, ticksBetweenPoints, currentBendValue, nextBendValue);
            }
        }

        private void GenerateBendValues(
            double currentTick,
            int channel,
            Track track,
            double ticksBetweenPoints,
            float currentBendValue,
            float nextBendValue)
        {
            var ticksPerValue = ticksBetweenPoints / Math.Abs(nextBendValue - currentBendValue);
            // bend up
            if (currentBendValue < nextBendValue)
            {
                while (currentBendValue <= nextBendValue)
                {
                    _handler.AddBend(track.Index, (int)currentTick, (byte)channel, (int)Math.Round(currentBendValue));
                    currentBendValue++;
                    currentTick += ticksPerValue;
                }
            }
            // bend down
            else if (currentBendValue > nextBendValue)
            {
                while (currentBendValue >= nextBendValue)
                {
                    _handler.AddBend(track.Index, (int)currentTick, (byte)channel, (int)Math.Round(currentBendValue));
                    currentBendValue--;
                    currentTick += ticksPerValue;
                }
            }
            // hold
            else
            {
                _handler.AddBend(track.Index, (int)currentTick, (byte)channel, (int)Math.Round(currentBendValue));
            }
        }

        private void GenerateTrill(
            Note note,
            int noteStart,
            MidiNoteDuration noteDuration,
            int noteKey,
            DynamicValue dynamicValue,
            int channel)
        {
            var track = note.Beat.Voice.Bar.Staff.Track;
            var trillKey = note.StringTuning + note.TrillFret;
            var trillLength = note.TrillSpeed.ToTicks();
            var realKey = true;
            var tick = noteStart;
            var end = noteStart + noteDuration.UntilTieEnd;
            while (tick + 10 < end)
            {
                // only the rest on last trill play
                if (tick + trillLength >= end)
                {
                    trillLength = end - tick;
                }

                _handler.AddNote(track.Index,
                    tick,
                    trillLength,
                    (byte)(realKey ? trillKey : noteKey),
                    dynamicValue,
                    (byte)channel);
                realKey = !realKey;
                tick += trillLength;
            }
        }

        private void GenerateTremoloPicking(
            Note note,
            int noteStart,
            MidiNoteDuration noteDuration,
            int noteKey,
            DynamicValue dynamicValue,
            int channel)
        {
            var track = note.Beat.Voice.Bar.Staff.Track;
            var tpLength = note.Beat.TremoloSpeed.Value.ToTicks();
            var tick = noteStart;
            var end = noteStart + noteDuration.UntilTieEnd;
            while (tick + 10 < end)
            {
                // only the rest on last trill play
                if (tick + tpLength >= end)
                {
                    tpLength = end - tick;
                }

                _handler.AddNote(track.Index, tick, tpLength, (byte)noteKey, dynamicValue, (byte)channel);
                tick += tpLength;
            }
        }

        private int[] GetBrushInfo(Beat beat)
        {
            var brushInfo = new int[beat.Voice.Bar.Staff.Tuning.Length];

            if (beat.BrushType != BrushType.None)
            {
                //
                // calculate the number of

                // a mask where the single bits indicate the strings used
                var stringUsed = 0;
                var stringCount = 0;

                for (int i = 0, j = beat.Notes.Count; i < j; i++)
                {
                    var n = beat.Notes[i];
                    if (n.IsTieDestination)
                    {
                        continue;
                    }

                    stringUsed |= 0x01 << (n.String - 1);
                    stringCount++;
                }

                //
                // calculate time offset for all strings
                if (beat.Notes.Count > 0)
                {
                    var brushMove = 0;
                    var brushIncrement = beat.BrushDuration / (stringCount - 1);
                    for (int i = 0, j = beat.Voice.Bar.Staff.Tuning.Length; i < j; i++)
                    {
                        var index = beat.BrushType == BrushType.ArpeggioDown || beat.BrushType == BrushType.BrushDown
                            ? i
                            : brushInfo.Length - 1 - i;
                        if ((stringUsed & (0x01 << index)) != 0)
                        {
                            brushInfo[index] = brushMove;
                            brushMove += brushIncrement;
                        }
                    }
                }
            }

            return brushInfo;
        }

        #endregion

        #region Automations

        private void GenerateAutomation(Beat beat, Automation automation, int startMove)
        {
            switch (automation.Type)
            {
                case AutomationType.Instrument:
                    _handler.AddProgramChange(beat.Voice.Bar.Staff.Track.Index,
                        beat.PlaybackStart + startMove,
                        (byte)beat.Voice.Bar.Staff.Track.PlaybackInfo.PrimaryChannel,
                        (byte)automation.Value);
                    _handler.AddProgramChange(beat.Voice.Bar.Staff.Track.Index,
                        beat.PlaybackStart + startMove,
                        (byte)beat.Voice.Bar.Staff.Track.PlaybackInfo.SecondaryChannel,
                        (byte)automation.Value);
                    break;
                case AutomationType.Balance:
                    var balance = ToChannelShort((int)automation.Value);
                    _handler.AddControlChange(beat.Voice.Bar.Staff.Track.Index,
                        beat.PlaybackStart + startMove,
                        (byte)beat.Voice.Bar.Staff.Track.PlaybackInfo.PrimaryChannel,
                        (byte)ControllerType.PanCoarse,
                        (byte)balance);
                    _handler.AddControlChange(beat.Voice.Bar.Staff.Track.Index,
                        beat.PlaybackStart + startMove,
                        (byte)beat.Voice.Bar.Staff.Track.PlaybackInfo.SecondaryChannel,
                        (byte)ControllerType.PanCoarse,
                        (byte)balance);
                    break;
                case AutomationType.Volume:
                    var volume = ToChannelShort((int)automation.Value);

                    _handler.AddControlChange(beat.Voice.Bar.Staff.Track.Index,
                        beat.PlaybackStart + startMove,
                        (byte)beat.Voice.Bar.Staff.Track.PlaybackInfo.PrimaryChannel,
                        (byte)ControllerType.VolumeCoarse,
                        (byte)volume);
                    _handler.AddControlChange(beat.Voice.Bar.Staff.Track.Index,
                        beat.PlaybackStart + startMove,
                        (byte)beat.Voice.Bar.Staff.Track.PlaybackInfo.SecondaryChannel,
                        (byte)ControllerType.VolumeCoarse,
                        (byte)volume);
                    break;
            }
        }

        #endregion
    }
}
