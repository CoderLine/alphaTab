/*
 * This file is part of alphaTab.
 * Copyright c 2013, Daniel Kuschny and Contributors, All rights reserved.
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
package alphatab.audio.generator;

import alphatab.audio.MidiUtils;
import alphatab.audio.model.MidiController;
import alphatab.audio.model.MidiFile;
import alphatab.audio.model.MidiTrack;
import alphatab.model.AccentuationType;
import alphatab.model.Automation;
import alphatab.model.AutomationType;
import alphatab.model.Bar;
import alphatab.model.Beat;
import alphatab.model.BrushType;
import alphatab.model.DynamicValue;
import alphatab.model.GraceType;
import alphatab.model.HarmonicType;
import alphatab.model.MasterBar;
import alphatab.model.Note;
import alphatab.model.PlaybackInformation;
import alphatab.model.Score;
import alphatab.model.SlideType;
import alphatab.model.Track;
import alphatab.model.VibratoType;
import alphatab.model.Voice;

/**
 * This generator creates a midi file using a score. 
 */
class MidiFileGenerator
{
    private var _score:Score;
    private var _handler:IMidiFileHandler;
    private var _currentTempo:Int;
    private var _metronomeTrack:Int;
    
    public var generateMetronome:Bool;
    
    public function new(score:Score, handler:IMidiFileHandler, generateMetronome:Bool=false) 
    {
        _score = score;
        _currentTempo = _score.tempo;
        _handler = handler;
        this.generateMetronome = generateMetronome;
    }
    
    public static function generateMidiFile(score:Score,generateMetronome:Bool=false) : MidiFile
    {
        var midiFile = new MidiFile();
        // create score tracks + metronometrack
        for (i in 0 ... score.tracks.length)
        {
            midiFile.createTrack();
        }
        midiFile.infoTrack = 0;

        var handler = new MidiFileHandler(midiFile);
        var generator = new MidiFileGenerator(score, handler, generateMetronome);
        generator.generate();
        return midiFile;
    }
    
    public function generate()
    {
        // initialize tracks
        for (track in _score.tracks)
        {
            generateTrack(track);
        }
        
        var controller = new MidiPlaybackController(_score);
        var previousMasterBar:MasterBar = null; // store the previous played bar for repeats
        while (!controller.finished())
        {
            var index = controller.index;
            var repeatMove = controller.repeatMove;
            controller.process();
            
            if (controller.shouldPlay)
            {
                generateMasterBar(_score.masterBars[index], previousMasterBar, controller.repeatMove);
                
                for (track in _score.tracks)
                {
                    generateBar(track.bars[index], controller.repeatMove);
                }
            }
            
            previousMasterBar = _score.masterBars[index];
        }
    }
    
    //
    // Track
    // 
    
    private function generateTrack(track:Track)
    {
        // channel
        generateChannel(track, track.playbackInfo.primaryChannel, track.playbackInfo);
        if (track.playbackInfo.primaryChannel != track.playbackInfo.secondaryChannel)
        {
            generateChannel(track, track.playbackInfo.secondaryChannel, track.playbackInfo);
        }
    }
    
    private function generateChannel(track:Track, channel:Int, playbackInfo:PlaybackInformation)
    {
        var volume = toChannelShort(playbackInfo.volume);
        var balance = toChannelShort(playbackInfo.balance);
        _handler.addControlChange(track.index, 0, channel, MidiController.Volume, volume);
        _handler.addControlChange(track.index, 0, channel, MidiController.Balance, balance);
        _handler.addControlChange(track.index, 0, channel, MidiController.Expression, 127); 
        _handler.addProgramChange(track.index, 0, channel, playbackInfo.program);
    }
    
    private static function toChannelShort(data:Int): Int
    {
        var value:Int = Std.int(Math.max(-32768, Math.min(32767, (data*8)-1)));
        return Std.int(Math.max(value, -1)) + 1;
    }
    
    //
    // MasterBar
    // 
    private function generateMasterBar(masterBar:MasterBar, previousMasterBar:MasterBar, startMove:Int)
    {
        // time signature
        if(previousMasterBar == null || 
           previousMasterBar.timeSignatureDenominator != masterBar.timeSignatureDenominator ||
           previousMasterBar.timeSignatureNumerator != masterBar.timeSignatureNumerator)
        {
            _handler.addTimeSignature(masterBar.start + startMove, masterBar.timeSignatureNumerator, masterBar.timeSignatureDenominator);
        }
        
        // tempo
        if (previousMasterBar == null)
        {
            _handler.addTempo(masterBar.start + startMove, masterBar.score.tempo);
            _currentTempo = masterBar.score.tempo;
        }
        else if (masterBar.tempoAutomation != null)
        {
            _handler.addTempo(masterBar.start + startMove, Std.int(masterBar.tempoAutomation.value));
            _currentTempo = Std.int(masterBar.tempoAutomation.value);
        }
        
        // metronome
        if (generateMetronome)
        {
            var start = masterBar.start + startMove;
            var length = MidiUtils.valueToTicks(masterBar.timeSignatureDenominator);
            for (i in 0 ... masterBar.timeSignatureNumerator)
            {
                _handler.addMetronome(start, length);
                start += length;
            }
        }
    }
    
    //
    // Bar -> Voice -> Beat -> Automations/Rests/Notes
    // 
    
    public function generateBar(bar:Bar, startMove:Int)
    {
        for (voice in bar.voices)
        {
            generateVoice(voice, startMove);
        }
    }
    
    public function generateVoice(voice:Voice, startMove:Int)
    {
        for (b in voice.beats)
        {
            generateBeat(b, startMove);
        }
    }
    
    public function generateBeat(beat:Beat, startMove:Int)
    {
        // TODO: take care of tripletfeel 
        var start = beat.start; 
        var duration = beat.calculateDuration();
        
        var track = beat.voice.bar.track;
        
        for (automation in beat.automations)
        {
            generateAutomation(beat, automation, startMove);
        }
        
        if (beat.isRest())
        {
            _handler.addRest(track.index, start + startMove, track.playbackInfo.primaryChannel);
        }
        else
        {
            var brushInfo = getBrushInfo(beat);

            for (n in beat.notes)
            {
                if (n.isTieDestination) continue;
                
                generateNote(n, start, duration, startMove, brushInfo);
            }
        }
    }
    
    private function generateNote(note:Note, beatStart:Int, beatDuration:Int, startMove:Int, brushInfo:Array<Int>)
    {
        var track = note.beat.voice.bar.track;
        var noteKey = track.capo + note.realValue();
        var noteStart = beatStart + startMove + brushInfo[note.string - 1];
        var noteDuration = getNoteDuration(note, beatDuration) - brushInfo[note.string -1];
        var dynamicValue = getDynamicValue(note);
                
        // 
        // Fade in
        if (note.beat.fadeIn)
        {
            generateFadeIn(note, noteStart, noteDuration, noteKey, dynamicValue);
        }
        
        // TODO: grace notes?
        
        //
        // Trill
        if (note.isTrill() && !track.isPercussion)
        {
            generateTrill(note, noteStart, noteDuration, noteKey, dynamicValue);
            // no further generation needed
            return;
        }
        
        //
        // Tremolo Picking
        if (note.beat.isTremolo())
        {
            generateTremoloPicking(note, noteStart, noteDuration, noteKey, dynamicValue);
            // no further generation needed
            return;
        }
        
        //
        // All String Bending/Variation effects
        if (note.hasBend())
        {
            generateBend(note, noteStart, noteDuration, noteKey, dynamicValue);
        }
        else if (note.beat.hasWhammyBar())
        {
            generateWhammyBar(note, noteStart, noteDuration, noteKey, dynamicValue);
        }
        else if (note.slideType != SlideType.None)
        {
            generateSlide(note, noteStart, noteDuration, noteKey, dynamicValue);
        }
        else if (note.vibrato != VibratoType.None)
        {
            generateVibrato(note, noteStart, noteDuration, noteKey, dynamicValue);
        }
        
        //
        // Harmonics
        if (note.harmonicType != HarmonicType.None)
        {
            generateHarmonic(note, noteStart, noteDuration, noteKey, dynamicValue);
        }
        
        _handler.addNote(track.index, noteStart, noteDuration, noteKey, dynamicValue, track.playbackInfo.primaryChannel);
    }
    
    private function getNoteDuration(note:Note, beatDuration:Int)
    {
        return applyDurationEffects(note, beatDuration);
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
    
    private function applyDurationEffects(note:Note, duration:Int)
    {
        if (note.isDead)
        {
            return applyStaticDuration(MidiFileHandler.DefaultDurationDead, duration);
        }
        if (note.isPalmMute)
        {
            return applyStaticDuration(MidiFileHandler.DefaultDurationPalmMute, duration);
        }
        if (note.isStaccato)
        {
            return Std.int(duration / 2);
        }
        return duration;
    }
    
    private function applyStaticDuration(duration:Int, maximum:Int)
    {
        var value = (_currentTempo * duration) / 60;
        return Std.int(Math.min(value, maximum));
    }
    
    private function getDynamicValue(note:Note)
    {
        var dynamicValue = note.dynamicValue;
        
        var allDynamics = DynamicValue.createAll();
        var currentIndex = Lambda.indexOf(allDynamics, dynamicValue);

        // more silent on hammer destination
        if (!note.beat.voice.bar.track.isPercussion && note.isHammerPullDestination)
        {
            currentIndex--;
        }
        
        // more silent on ghost notes
        if (note.isGhost)
        {
            currentIndex--;
        }
        
        // louder on accent
        switch(note.accentuated)
        {
            case Normal:
                currentIndex++;
            case Heavy:
                currentIndex += 2;
            default:
        }
        
        return allDynamics[Std.int(Math.max(0, Math.min(allDynamics.length - 1, currentIndex)))];
    }

    
    //
    // Effect Generation
    
    private function generateFadeIn(note:Note, noteStart:Int, noteDuration:Int, noteKey:Int, dynamicValue:DynamicValue)
    {
        // TODO
    }
    
    private function generateHarmonic(note:Note, noteStart:Int, noteDuration:Int, noteKey:Int, dynamicValue:DynamicValue)
    {
        // TODO
    }
    
    private function generateVibrato(note:Note, noteStart:Int, noteDuration:Int, noteKey:Int, dynamicValue:DynamicValue)
    {
        // TODO 
    }
    
    private function generateSlide(note:Note, noteStart:Int, noteDuration:Int, noteKey:Int, dynamicValue:DynamicValue)
    {
        // TODO 
    }
    
    private function generateWhammyBar(note:Note, noteStart:Int, noteDuration:Int, noteKey:Int, dynamicValue:DynamicValue)
    {
        // TODO 
    }
    
    private function generateBend(note:Note, noteStart:Int, noteDuration:Int, noteKey:Int, dynamicValue:DynamicValue)
    {
        // TODO 
    }
    
    private function generateTrill(note:Note, noteStart:Int, noteDuration:Int, noteKey:Int, dynamicValue:DynamicValue)
    {
        var track = note.beat.voice.bar.track;
        var trillKey = track.capo + note.stringTuning() + note.trillFret();
        var trillLength = MidiUtils.durationToTicks(note.trillSpeed);
        var realKey = true;
        var tick = noteStart;
        while (tick + 10 < (noteStart + noteDuration))
        {
            // only the rest on last trill play
            if ((tick + trillLength) >= (noteStart + noteDuration))
            {
                trillLength = (noteStart + noteDuration) - tick;
             }
            _handler.addNote(track.index, tick, trillLength, realKey ? trillKey : noteKey, dynamicValue, track.playbackInfo.primaryChannel);
            realKey = !realKey;
            tick += trillLength;
        }
    }
    
    private function generateTremoloPicking(note:Note, noteStart:Int, noteDuration:Int, noteKey:Int, dynamicValue:DynamicValue)
    {
        var track = note.beat.voice.bar.track;
        var tpLength = MidiUtils.durationToTicks(note.beat.tremoloSpeed);
        var tick = noteStart;
        while (tick + 10 < (noteStart + noteDuration))
        {
            // only the rest on last trill play
            if ((tick + tpLength) >= (noteStart + noteDuration))
            {
                tpLength = (noteStart + noteDuration) - tick;
            }
            _handler.addNote(track.index, tick, tpLength, noteKey, dynamicValue, track.playbackInfo.primaryChannel);
            tick += tpLength;
        }
    }
    
    private function getBrushInfo(beat:Beat) : Array<Int>
    {
        var brushInfo = new Array<Int>();
        
        for (i in 0 ... beat.voice.bar.track.tuning.length)
        {
            brushInfo.push(0);
        }
        
        if ( beat.brushType != BrushType.None)
        {
            // 
            // calculate the number of  
            
            // a mask where the single bits indicate the strings used
            var stringUsed = 0;
            var stringCount = 0;
            
            for (n in beat.notes)
            {
                if (n.isTieDestination) continue;
                stringUsed |= 0x01 << (n.string - 1);
                stringCount++;
            }
            
            //
            // calculate time offset for all strings
            if (beat.notes.length > 0)
            {
                var brushMove = 0;
                var brushIncrement = getBrushIncrement(beat);
                for (i in 0 ... beat.voice.bar.track.tuning.length)
                {
                    var index = (beat.brushType == BrushType.ArpeggioDown || beat.brushType == BrushType.BrushDown) 
                                ? i
                                : ((brushInfo.length - 1) - i);
                    if ( (stringUsed & (0x01 << index)) != 0)
                    {
                        brushInfo[index] = brushMove;
                        brushMove = brushIncrement;
                    }
                }
            }
        }
        
        return brushInfo;        
    }
    
    private function getBrushIncrement(beat:Beat)
    {
        if (beat.brushDuration == 0) return 0;
        var duration = beat.calculateDuration();
        if (duration == 0) return 0;
        return Std.int((duration / 8.0) * (4.0 / beat.brushDuration));
    }
    
    //
    // Automations
    
    private function generateAutomation(beat:Beat, automation:Automation, startMove:Int)
    {
        switch(automation.type)
        {
            case Instrument:
                _handler.addProgramChange(beat.voice.bar.track.index, beat.start + startMove, 
                                            beat.voice.bar.track.playbackInfo.primaryChannel, 
                                            Std.int(automation.value));
                _handler.addProgramChange(beat.voice.bar.track.index, beat.start + startMove, 
                                            beat.voice.bar.track.playbackInfo.secondaryChannel, 
                                            Std.int(automation.value));
            case Balance:
                _handler.addControlChange(beat.voice.bar.track.index, beat.start + startMove, 
                                            beat.voice.bar.track.playbackInfo.primaryChannel,
                                            MidiController.Balance,
                                            Std.int(automation.value));
                _handler.addControlChange(beat.voice.bar.track.index, beat.start + startMove, 
                                            beat.voice.bar.track.playbackInfo.secondaryChannel,
                                            MidiController.Balance,
                                            Std.int(automation.value));
            case Volume:
                _handler.addControlChange(beat.voice.bar.track.index, beat.start + startMove, 
                                            beat.voice.bar.track.playbackInfo.primaryChannel,
                                            MidiController.Volume,
                                            Std.int(automation.value));
                _handler.addControlChange(beat.voice.bar.track.index,  beat.start + startMove, 
                                            beat.voice.bar.track.playbackInfo.secondaryChannel,
                                            MidiController.Volume,
                                            Std.int(automation.value));
            default:
        }
        
    }
}