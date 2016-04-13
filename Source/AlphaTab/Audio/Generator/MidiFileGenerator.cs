﻿/*
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

        public bool GenerateMetronome { get; set; }

        public MidiFileGenerator(Score score, IMidiFileHandler handler, bool generateMetronome = false)
        {
            _score = score;
            _currentTempo = _score.Tempo;
            _handler = handler;
            GenerateMetronome = generateMetronome;
        }

        public static MidiFile GenerateMidiFile(Score score, bool generateMetronome = false)
        {
            var midiFile = new MidiFile();
            // create score tracks + metronometrack
            for (int i = 0, j = score.Tracks.Count; i < j; i++)
            {
                midiFile.CreateTrack();
            }
            midiFile.InfoTrack = 0;

            var handler = new MidiFileHandler(midiFile);
            var generator = new MidiFileGenerator(score, handler, generateMetronome);
            generator.Generate();
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
                        GenerateBar(_score.Tracks[i].Bars[index], currentTick);
                    }
                }
                controller.MoveNext();
                previousMasterBar = bar;
            }
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
            _handler.AddControlChange(track.Index, 0, channel, (byte)MidiController.Volume, (byte)volume);
            _handler.AddControlChange(track.Index, 0, channel, (byte)MidiController.Balance, (byte)balance);
            _handler.AddControlChange(track.Index, 0, channel, (byte)MidiController.Expression, 127);
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

            // metronome
            if (GenerateMetronome)
            {
                var start = currentTick;
                var length = MidiUtils.ValueToTicks(masterBar.TimeSignatureDenominator);
                for (int i = 0; i < masterBar.TimeSignatureNumerator; i++)
                {
                    _handler.AddMetronome(start, length);
                    start += length;
                }
            }
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
            for (int i = 0, j = voice.Beats.Count; i < j; i++)
            {
                GenerateBeat(voice.Beats[i], barStartTick);
            }
        }

        private void GenerateBeat(Beat beat, int barStartTick)
        {
            // TODO: take care of tripletfeel 
            var beatStart = beat.Start;
            var duration = beat.CalculateDuration();

            var track = beat.Voice.Bar.Track;

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
                    if (n.IsTieDestination) continue;

                    GenerateNote(n, barStartTick + beatStart, duration, brushInfo);
                }
            }
        }

        private void GenerateNote(Note note, int beatStart, int beatDuration, int[] brushInfo)
        {
            var track = note.Beat.Voice.Bar.Track;
            var noteKey = track.Capo + note.RealValue;
            var noteStart = beatStart + brushInfo[note.String - 1];
            var noteDuration = GetNoteDuration(note, beatDuration) - brushInfo[note.String - 1];
            var dynamicValue = GetDynamicValue(note);

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

            _handler.AddNote(track.Index, noteStart, noteDuration, (byte)noteKey, dynamicValue, (byte)track.PlaybackInfo.PrimaryChannel);
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
                return GetTieOriginNoteDuration(note);
            }
            return duration;
        }

        private int ApplyStaticDuration(int duration, int maximum)
        {
            var value = (_currentTempo * duration) / 60;
            return Math.Min(value, maximum);
        }

        private int GetTieOriginNoteDuration(Note startNote) {
            int duration = 0;

            Note note = startNote;
            for (Beat beat = note.Beat; ; beat = beat.NextBeat) 
            {
                duration += beat.Duration.ToTicks();

                Note destination = note.TieDestination;
                if (beat == destination.Beat) 
                {
                    if (destination.IsTieOrigin)
                    {
                        note = destination;
                    }
                    else
                    {
                        break;
                    }
                }
            }
            return duration;
        }

        private DynamicValue GetDynamicValue(Note note)
        {
            var dynamicValue = note.Dynamic;

            // more silent on hammer destination
            if (!note.Beat.Voice.Bar.Track.IsPercussion && note.HammerPullOrigin != null)
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
            // TODO
        }

        private void GenerateHarmonic(Note note, int noteStart, int noteDuration, int noteKey, DynamicValue dynamicValue)
        {
            // TODO
        }

        private void GenerateVibrato(Note note, int noteStart, int noteDuration, int noteKey, DynamicValue dynamicValue)
        {
            // TODO 
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
            var track = note.Beat.Voice.Bar.Track;
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
                var tick = noteStart + (ticksPerPosition*currentPoint.Offset);
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

            // reset bend
            _handler.AddBend(track.Index, noteStart + noteDuration, (byte)track.PlaybackInfo.PrimaryChannel, DefaultBend);
        }

        private void GenerateTrill(Note note, int noteStart, int noteDuration, int noteKey, DynamicValue dynamicValue)
        {
            var track = note.Beat.Voice.Bar.Track;
            var trillKey = track.Capo + note.StringTuning + note.TrillFret;
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
            var track = note.Beat.Voice.Bar.Track;
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
            var brushInfo = new int[beat.Voice.Bar.Track.Tuning.Length];

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
                    for (int i = 0, j = beat.Voice.Bar.Track.Tuning.Length; i < j; i++)
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
                    _handler.AddProgramChange(beat.Voice.Bar.Track.Index, beat.Start + startMove,
                                                (byte)beat.Voice.Bar.Track.PlaybackInfo.PrimaryChannel,
                                                (byte)(automation.Value));
                    _handler.AddProgramChange(beat.Voice.Bar.Track.Index, beat.Start + startMove,
                                                (byte)beat.Voice.Bar.Track.PlaybackInfo.SecondaryChannel,
                                                (byte)(automation.Value));
                    break;
                case AutomationType.Balance:
                    _handler.AddControlChange(beat.Voice.Bar.Track.Index, beat.Start + startMove,
                                                (byte)beat.Voice.Bar.Track.PlaybackInfo.PrimaryChannel,
                                                (byte)MidiController.Balance,
                                                (byte)(automation.Value));
                    _handler.AddControlChange(beat.Voice.Bar.Track.Index, beat.Start + startMove,
                                                (byte)beat.Voice.Bar.Track.PlaybackInfo.SecondaryChannel,
                                                (byte)MidiController.Balance,
                                                (byte)(automation.Value));
                    break;
                case AutomationType.Volume:
                    _handler.AddControlChange(beat.Voice.Bar.Track.Index, beat.Start + startMove,
                                                (byte)beat.Voice.Bar.Track.PlaybackInfo.PrimaryChannel,
                                                (byte)MidiController.Volume,
                                                (byte)(automation.Value));
                    _handler.AddControlChange(beat.Voice.Bar.Track.Index, beat.Start + startMove,
                                                (byte)beat.Voice.Bar.Track.PlaybackInfo.SecondaryChannel,
                                                (byte)MidiController.Volume,
                                                (byte)(automation.Value));
                    break;
            }
        }

        #endregion
    }
}
