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
using System;
using AlphaTab.Audio.Model;
using AlphaTab.Model;

namespace AlphaTab.Audio.Generator
{
    /// <summary>
    /// This generator creates a midi file using a score. 
    /// </summary>
    public class MidiFileGenerator
    {
        private readonly Score _score;
        private readonly IMidiFileHandler _handler;
        private int _currentTempo;


        public MidiTickLookup TickLookup { get; private set; }


        public MidiFileGenerator(Score score, IMidiFileHandler handler)
        {
            _score = score;
            _currentTempo = _score.Tempo;
            _handler = handler;
            TickLookup = new MidiTickLookup();
        }

        public static MidiFile GenerateMidiFile(Score score)
        {
            var midiFile = new MidiFile();
            // create score tracks + metronometrack
            for (int i = 0, j = score.Tracks.Count; i < j; i++)
            {
                midiFile.CreateTrack();
            }
            midiFile.InfoTrack = 0;
            

            var handler = new MidiFileHandler(midiFile);
            var generator = new MidiFileGenerator(score, handler);
            generator.Generate();
            midiFile.TickLookup = generator.TickLookup;
            return midiFile;
        }

        public void Generate()
        {
            // initialize tracks
            for (int i = 0, j = _score.Tracks.Count; i < j; i++)
            {
                GenerateTrack(_score.Tracks[i]);
            }

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
            _handler.AddControlChange(track.Index, 0, channel, (byte)MidiController.VolumeCoarse, (byte)volume);
            _handler.AddControlChange(track.Index, 0, channel, (byte)MidiController.PanCoarse, (byte)balance);
            _handler.AddControlChange(track.Index, 0, channel, (byte)MidiController.ExpressionControllerCoarse, 127);

            // set parameter that is being updated (0) -> PitchBendRangeCoarse
            _handler.AddControlChange(track.Index, 0, channel, (byte)MidiController.RegisteredParameterFine, 0);
            _handler.AddControlChange(track.Index, 0, channel, (byte)MidiController.RegisteredParameterCourse, 0);

            // Set PitchBendRangeCoarse to 12
            _handler.AddControlChange(track.Index, 0, channel, (byte)MidiController.DataEntryFine, 0);
            _handler.AddControlChange(track.Index, 0, channel, (byte)MidiController.DataEntryCoarse, 12);

            _handler.AddProgramChange(track.Index, 0, channel, (byte)playbackInfo.Program);
        }

        public static int ToChannelShort(int data)
        {
            var value = Math.Max(-32768, Math.Min(32767, (data * 8) - 1));
            return (Math.Max(value, -1)) + 1;
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
                _handler.AddTimeSignature(currentTick, masterBar.TimeSignatureNumerator, masterBar.TimeSignatureDenominator);
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
                _currentTempo = (int)(masterBar.TempoAutomation.Value);
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

        public void GenerateBar(Bar bar, int barStartTick)
        {
            for (int i = 0, j = bar.Voices.Count; i < j; i++)
            {
                GenerateVoice(bar.Voices[i], barStartTick);
            }
        }

        private void GenerateVoice(Voice voice, int barStartTick)
        {
            if (voice.IsEmpty && (!voice.Bar.IsEmpty || voice.Index != 0)) return;

            for (int i = 0, j = voice.Beats.Count; i < j; i++)
            {
                GenerateBeat(voice.Beats[i], barStartTick);
            }
        }

        private void GenerateBeat(Beat beat, int barStartTick)
        {
            // TODO: take care of tripletfeel 
            var beatStart = beat.Start;
            var audioDuration = beat.Voice.Bar.IsEmpty
                ? beat.Voice.Bar.MasterBar.CalculateDuration()
                : beat.CalculateDuration();

            var beatLookup = new BeatTickLookup();
            beatLookup.Start = barStartTick + beatStart;
            var realTickOffset = beat.NextBeat == null ? audioDuration : beat.NextBeat.AbsoluteStart - beat.AbsoluteStart;
            beatLookup.End = barStartTick + beatStart + (realTickOffset > audioDuration ? realTickOffset : audioDuration);
            beatLookup.Beat = beat;
            TickLookup.AddBeat(beatLookup);

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
                const int phaseLength = 240; // ticks
                const int bendAmplitude = 3;

                GenerateVibratorWithParams(beat.Voice.Bar.Staff.Track, barStartTick + beatStart, beat.CalculateDuration(), phaseLength, bendAmplitude);
            }
        }

        private void GenerateNote(Note note, int beatStart, int beatDuration, int[] brushInfo)
        {
            var track = note.Beat.Voice.Bar.Staff.Track;
            var noteKey = note.RealValue;
            var brushOffset = note.IsStringed && note.String <= brushInfo.Length ? brushInfo[note.String - 1] : 0;
            var noteStart = beatStart + brushOffset;
            var noteDuration = GetNoteDuration(note, beatDuration) - brushOffset;
            var dynamicValue = GetDynamicValue(note);

            // TODO: enable second condition after whammy generation is implemented
            if (!note.HasBend /* && !note.Beat.HasWhammyBar */)
            {
                // reset bend 
                _handler.AddBend(track.Index, noteStart, (byte)track.PlaybackInfo.PrimaryChannel, DefaultBend);
            }

            // 
            // Fade in
            if (note.Beat.FadeIn)
            {
                GenerateFadeIn(note, noteStart, noteDuration, noteKey, dynamicValue);
            }

            // TODO: grace notes?

            //
            // Trill
            if (note.IsTrill && !track.IsPercussion)
            {
                GenerateTrill(note, noteStart, noteDuration, noteKey, dynamicValue);
                // no further generation needed
                return;
            }

            //
            // Tremolo Picking
            if (note.Beat.IsTremolo)
            {
                GenerateTremoloPicking(note, noteStart, noteDuration, noteKey, dynamicValue);
                // no further generation needed
                return;
            }

            //
            // All String Bending/Variation effects
            if (note.HasBend)
            {
                GenerateBend(note, noteStart, noteDuration, noteKey, dynamicValue);
            }
            else if (note.Beat.HasWhammyBar)
            {
                GenerateWhammyBar(note, noteStart, noteDuration, noteKey, dynamicValue);
            }
            else if (note.SlideType != SlideType.None)
            {
                GenerateSlide(note, noteStart, noteDuration, noteKey, dynamicValue);
            }
            else if (note.Vibrato != VibratoType.None)
            {
                GenerateVibrato(note, noteStart, noteDuration, noteKey, dynamicValue);
            }


            //
            // Harmonics
            if (note.HarmonicType != HarmonicType.None)
            {
                GenerateHarmonic(note, noteStart, noteDuration, noteKey, dynamicValue);
            }

            if (!note.IsTieDestination)
            {
                _handler.AddNote(track.Index, noteStart, noteDuration, (byte)noteKey, dynamicValue, (byte)track.PlaybackInfo.PrimaryChannel);
            }
        }

        private int GetNoteDuration(Note note, int beatDuration)
        {
            return ApplyDurationEffects(note, beatDuration);
            // a bit buggy:
            /*
            var lastNoteEnd = note.beat.start - note.beat.calculateDuration();
            var noteDuration = beatDuration;
            var currentBeat = note.beat.nextBeat;
        
            var letRingSuspend = false;
        
            // find the real note duration (let ring)
            while (currentBeat != null)
            {
                if (currentBeat.isRest())
                {
                    return applyDurationEffects(note, noteDuration);
                }
            
                var letRing = currentBeat.voice == note.beat.voice && note.isLetRing;
                var letRingApplied = false;
            
                // we look for a note which still has let ring on or is a tie destination
                // in this case we increate the first played note
                var noteOnSameString = currentBeat.getNoteOnString(note.string);
                if (noteOnSameString != null)
                {
                    // quit letring?
                    if (!noteOnSameString.isTieDestination)
                    {
                        letRing = false; 
                        letRingSuspend = true;
                    
                        // no let ring anymore, we are done
                        if (!noteOnSameString.isLetRing)
                        {
                            return applyDurationEffects(note, noteDuration);
                        }
                    }
                
                    // increase duration 
                    letRingApplied = true;
                    noteDuration += (currentBeat.start - lastNoteEnd) + noteOnSameString.beat.calculateDuration();
                    lastNoteEnd = currentBeat.start + currentBeat.calculateDuration();
                }
            
                // if letRing is still active? (no note on the same string found)
                // and we didn't apply it already and of course it's not already stopped 
                // then we increase our duration as well
                if (letRing && !letRingApplied && !letRingSuspend)
                {
                    noteDuration += (currentBeat.start - lastNoteEnd) + currentBeat.calculateDuration();
                    lastNoteEnd = currentBeat.start + currentBeat.calculateDuration();
                }
            
            
                currentBeat = currentBeat.nextBeat;
            }
        
            return applyDurationEffects(note, noteDuration);*/
        }

        private int ApplyDurationEffects(Note note, int duration)
        {
            if (note.IsDead)
            {
                return ApplyStaticDuration(MidiFileHandler.DefaultDurationDead, duration);
            }
            if (note.IsPalmMute)
            {
                return ApplyStaticDuration(MidiFileHandler.DefaultDurationPalmMute, duration);
            }
            if (note.IsStaccato)
            {
                return (duration / 2);
            }
            if (note.IsTieOrigin)
            {
                var endNote = note.TieDestination;

                // for the initial start of the tie calculate absolute duration from start to end note
                if (!note.IsTieDestination)
                {
                    var startTick = note.Beat.AbsoluteStart;
                    var endTick = endNote.Beat.AbsoluteStart + GetNoteDuration(endNote, endNote.Beat.CalculateDuration());
                    return endTick - startTick;
                }
                else
                {
                    // for continuing ties, take the current duration + the one from the destination 
                    // this branch will be entered as part of the recusion of the if branch
                    return duration + GetNoteDuration(endNote, endNote.Beat.CalculateDuration());
                }
            }
            return duration;
        }

        private int ApplyStaticDuration(int duration, int maximum)
        {
            var value = (_currentTempo * duration) / 60;
            return Math.Min(value, maximum);
        }

        private DynamicValue GetDynamicValue(Note note)
        {
            var dynamicValue = note.Dynamic;

            // more silent on hammer destination
            if (!note.Beat.Voice.Bar.Staff.Track.IsPercussion && note.HammerPullOrigin != null)
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

        private void GenerateFadeIn(Note note, int noteStart, int noteDuration, int noteKey, DynamicValue dynamicValue)
        {
            var track = note.Beat.Voice.Bar.Staff.Track;
            var endVolume = ToChannelShort(track.PlaybackInfo.Volume);
            var volumeFactor = (float)endVolume / noteDuration;

            var tickStep = 120;
            int steps = (noteDuration / tickStep);

            var endTick = noteStart + noteDuration;
            for (int i = steps - 1; i >= 0; i--)
            {
                var tick = endTick - (i * tickStep);
                var volume = (tick - noteStart) * volumeFactor;
                if (i == steps - 1)
                {
                    _handler.AddControlChange(track.Index, noteStart, (byte)track.PlaybackInfo.PrimaryChannel, (byte)MidiController.VolumeCoarse, (byte)volume);
                    _handler.AddControlChange(track.Index, noteStart, (byte)track.PlaybackInfo.SecondaryChannel, (byte)MidiController.VolumeCoarse, (byte)volume);
                }
                _handler.AddControlChange(track.Index, tick, (byte)track.PlaybackInfo.PrimaryChannel, (byte)MidiController.VolumeCoarse, (byte)volume);
                _handler.AddControlChange(track.Index, tick, (byte)track.PlaybackInfo.SecondaryChannel, (byte)MidiController.VolumeCoarse, (byte)volume);
            }
        }

        private void GenerateHarmonic(Note note, int noteStart, int noteDuration, int noteKey, DynamicValue dynamicValue)
        {
            // TODO
        }

        private void GenerateVibrato(Note note, int noteStart, int noteDuration, int noteKey, DynamicValue dynamicValue)
        {
            const int phaseLength = 480; // ticks
            const int bendAmplitude = 2;
            var track = note.Beat.Voice.Bar.Staff.Track;

            GenerateVibratorWithParams(track, noteStart, noteDuration, phaseLength, bendAmplitude);
        }

        private void GenerateVibratorWithParams(Track track, int noteStart, int noteDuration, int phaseLength, int bendAmplitude)
        {
            const int resolution = 16;

            int phaseHalf = phaseLength / 2;
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

                    _handler.AddBend(track.Index, noteStart + phase, (byte)track.PlaybackInfo.PrimaryChannel, (byte)(DefaultBend + bend));

                    phase += resolution;
                }

                noteStart += phaseLength;
            }
        }

        private void GenerateSlide(Note note, int noteStart, int noteDuration, int noteKey, DynamicValue dynamicValue)
        {
            // TODO 
        }

        private void GenerateWhammyBar(Note note, int noteStart, int noteDuration, int noteKey, DynamicValue dynamicValue)
        {
            // TODO 
        }

        private const int DefaultBend = 0x40;
        private const float DefaultBendSemitone = 2.75f;

        private void GenerateBend(Note note, int noteStart, int noteDuration, int noteKey, DynamicValue dynamicValue)
        {
            var track = note.Beat.Voice.Bar.Staff.Track;
            var ticksPerPosition = ((double)noteDuration) / BendPoint.MaxPosition;
            for (int i = 0; i < note.BendPoints.Count - 1; i++)
            {
                var currentPoint = note.BendPoints[i];
                var nextPoint = note.BendPoints[i + 1];

                // calculate the midi pitchbend values start and end values
                var currentBendValue = DefaultBend + (currentPoint.Value * DefaultBendSemitone);
                var nextBendValue = DefaultBend + (nextPoint.Value * DefaultBendSemitone);

                // how many midi ticks do we have to spend between this point and the next one?
                var ticksBetweenPoints = ticksPerPosition * (nextPoint.Offset - currentPoint.Offset);

                // we will generate one pitchbend message for each value
                // for this we need to calculate how many ticks to offset per value

                var ticksPerValue = ticksBetweenPoints / Math.Abs(nextBendValue - currentBendValue);
                var tick = noteStart + (ticksPerPosition * currentPoint.Offset);
                // bend up
                if (currentBendValue < nextBendValue)
                {
                    while (currentBendValue <= nextBendValue)
                    {
                        _handler.AddBend(track.Index, (int)tick, (byte)track.PlaybackInfo.PrimaryChannel, (byte)Math.Round(currentBendValue));
                        currentBendValue++;
                        tick += ticksPerValue;
                    }
                }
                // bend down
                else if (currentBendValue > nextBendValue)
                {
                    while (currentBendValue >= nextBendValue)
                    {
                        _handler.AddBend(track.Index, (int)tick, (byte)track.PlaybackInfo.PrimaryChannel, (byte)Math.Round(currentBendValue));
                        currentBendValue--;
                        tick += ticksPerValue;
                    }
                }
            }
        }

        private void GenerateTrill(Note note, int noteStart, int noteDuration, int noteKey, DynamicValue dynamicValue)
        {
            var track = note.Beat.Voice.Bar.Staff.Track;
            var trillKey = note.StringTuning + note.TrillFret;
            var trillLength = note.TrillSpeed.ToTicks();
            var realKey = true;
            var tick = noteStart;
            while (tick + 10 < (noteStart + noteDuration))
            {
                // only the rest on last trill play
                if ((tick + trillLength) >= (noteStart + noteDuration))
                {
                    trillLength = (noteStart + noteDuration) - tick;
                }
                _handler.AddNote(track.Index, tick, trillLength, (byte)(realKey ? trillKey : noteKey), dynamicValue, (byte)track.PlaybackInfo.PrimaryChannel);
                realKey = !realKey;
                tick += trillLength;
            }
        }

        private void GenerateTremoloPicking(Note note, int noteStart, int noteDuration, int noteKey, DynamicValue dynamicValue)
        {
            var track = note.Beat.Voice.Bar.Staff.Track;
            var tpLength = note.Beat.TremoloSpeed.Value.ToTicks();
            var tick = noteStart;
            while (tick + 10 < (noteStart + noteDuration))
            {
                // only the rest on last trill play
                if ((tick + tpLength) >= (noteStart + noteDuration))
                {
                    tpLength = (noteStart + noteDuration) - tick;
                }
                _handler.AddNote(track.Index, tick, tpLength, (byte)noteKey, dynamicValue, (byte)track.PlaybackInfo.PrimaryChannel);
                tick += tpLength;
            }
        }

        private int[] GetBrushInfo(Beat beat)
        {
            var brushInfo = new int[beat.Voice.Bar.Staff.Track.Tuning.Length];

            if (beat.BrushType != BrushType.None)
            {
                // 
                // calculate the number of  

                // a mask where the single bits indicate the strings used
                var stringUsed = 0;

                for (int i = 0, j = beat.Notes.Count; i < j; i++)
                {
                    var n = beat.Notes[i];
                    if (n.IsTieDestination) continue;
                    stringUsed |= 0x01 << (n.String - 1);
                }

                //
                // calculate time offset for all strings
                if (beat.Notes.Count > 0)
                {
                    int brushMove = 0;
                    var brushIncrement = GetBrushIncrement(beat);
                    for (int i = 0, j = beat.Voice.Bar.Staff.Track.Tuning.Length; i < j; i++)
                    {
                        var index = (beat.BrushType == BrushType.ArpeggioDown || beat.BrushType == BrushType.BrushDown)
                                    ? i
                                    : ((brushInfo.Length - 1) - i);
                        if ((stringUsed & (0x01 << index)) != 0)
                        {
                            brushInfo[index] = brushMove;
                            brushMove = brushIncrement;
                        }
                    }
                }
            }

            return brushInfo;
        }

        private int GetBrushIncrement(Beat beat)
        {
            if (beat.BrushDuration == 0) return 0;
            var duration = beat.CalculateDuration();
            if (duration == 0) return 0;
            return (int)((duration / 8.0) * (4.0 / beat.BrushDuration));
        }

        #endregion

        #region Automations

        private void GenerateAutomation(Beat beat, Automation automation, int startMove)
        {
            switch (automation.Type)
            {
                case AutomationType.Instrument:
                    _handler.AddProgramChange(beat.Voice.Bar.Staff.Track.Index, beat.Start + startMove,
                                                (byte)beat.Voice.Bar.Staff.Track.PlaybackInfo.PrimaryChannel,
                                                (byte)(automation.Value));
                    _handler.AddProgramChange(beat.Voice.Bar.Staff.Track.Index, beat.Start + startMove,
                                                (byte)beat.Voice.Bar.Staff.Track.PlaybackInfo.SecondaryChannel,
                                                (byte)(automation.Value));
                    break;
                case AutomationType.Balance:
                    var balance = ToChannelShort((int)automation.Value);
                    _handler.AddControlChange(beat.Voice.Bar.Staff.Track.Index, beat.Start + startMove,
                                                (byte)beat.Voice.Bar.Staff.Track.PlaybackInfo.PrimaryChannel,
                                                (byte)MidiController.PanCoarse,
                                                (byte)balance);
                    _handler.AddControlChange(beat.Voice.Bar.Staff.Track.Index, beat.Start + startMove,
                                                (byte)beat.Voice.Bar.Staff.Track.PlaybackInfo.SecondaryChannel,
                                                (byte)MidiController.PanCoarse,
                                                (byte)balance);
                    break;
                case AutomationType.Volume:
                    var volume = ToChannelShort((int)automation.Value);

                    _handler.AddControlChange(beat.Voice.Bar.Staff.Track.Index, beat.Start + startMove,
                                                (byte)beat.Voice.Bar.Staff.Track.PlaybackInfo.PrimaryChannel,
                                                (byte)MidiController.VolumeCoarse,
                                                (byte)volume);
                    _handler.AddControlChange(beat.Voice.Bar.Staff.Track.Index, beat.Start + startMove,
                                                (byte)beat.Voice.Bar.Staff.Track.PlaybackInfo.SecondaryChannel,
                                                (byte)MidiController.VolumeCoarse,
                                                (byte)volume);
                    break;
            }
        }

        #endregion
    }
}