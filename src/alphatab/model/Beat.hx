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
package alphatab.model;

import alphatab.audio.MidiUtils;
import alphatab.rendering.glyphs.CrescendoType;

/**
 * A beat is a single block within a bar. A beat is a combination
 * of several notes played at the same time. 
 */
class Beat 
{
    public static inline var WhammyBarMaxPosition = 60;
    public static inline var WhammyBarMaxValue = 24;
    
    
    public var previousBeat:Beat;
    public var nextBeat:Beat;
    public var index:Int;
    
    public var voice:Voice;
    public var notes:Array<Note>;
    private var _minNote:Note;
    public function minNote():Note { if (_minNote == null) refreshNotes(); return _minNote; }
    private var _maxNote:Note;
    public function maxNote():Note { if (_maxNote == null) refreshNotes(); return _maxNote; }
    public var duration:Duration;
    
    public var isEmpty:Bool;
    
    public var automations:Array<Automation>;
    
    public function isRest():Bool 
    {
        return notes.length == 0;
    }

    // effects
    public var dots:Int;
    public var fadeIn:Bool;
    public var lyrics:Array<String>;
    public var pop:Bool;
    public var hasRasgueado:Bool;
    public var slap:Bool;
    public var tap:Bool;
    public var text:String;
    
    public var brushType:BrushType;
    public var brushDuration:Int;
    
    public var tupletDenominator:Int;
    public var tupletNumerator:Int;
    
    public var whammyBarPoints:Array<BendPoint>;
    public inline function hasWhammyBar():Bool { return whammyBarPoints.length > 0; }
    
    public var vibrato:VibratoType;
    public var chordId:String;
    public inline function hasChord():Bool { return chordId != null; }
    public inline function chord():Chord { return voice.bar.track.chords.get(chordId); }
    public var graceType:GraceType;
    public var pickStroke:PickStrokeType;
    
    public inline function isTremolo():Bool { return tremoloSpeed != null; }
    public var tremoloSpeed:Null<Duration>;
    
    public var crescendo:CrescendoType;
    
    /**
     * The timeline position of the voice within the current bar. (unit: midi ticks)
     */
    public var start:Int;
    
    public var dynamicValue:DynamicValue;
    
    public function new() 
    {
        whammyBarPoints = new Array<BendPoint>();
        notes = new Array<Note>();
        brushType = BrushType.None;
        vibrato = VibratoType.None;
        graceType = GraceType.None;
        pickStroke = PickStrokeType.None;
        duration = Duration.Quarter;
        tremoloSpeed = null;
        automations = new Array<Automation>();
        start = 0;        
        tupletDenominator = -1;
        tupletNumerator = -1;
        dynamicValue = DynamicValue.F;
        crescendo = CrescendoType.None;
    }
    
    public function clone() : Beat
    {
        var beat = new Beat();
        for (b in whammyBarPoints)
        {
            beat.whammyBarPoints.push(b.clone());
        }
        for (n in notes)
        {
            beat.addNote(n.clone());
        }
        beat.chordId = chordId;
        beat.brushType = brushType;
        beat.vibrato = vibrato;
        beat.graceType = graceType;
        beat.pickStroke = pickStroke;
        beat.duration = duration;
        beat.tremoloSpeed = tremoloSpeed;
        beat.text = text;
        beat.fadeIn = fadeIn;
        beat.tap = tap;
        beat.slap = slap;
        beat.pop = pop;
        for (a in automations)
        {
            beat.automations.push(a.clone());
        }
        beat.start = start;
        beat.tupletDenominator = tupletDenominator;
        beat.tupletNumerator = tupletNumerator;       
        beat.dynamicValue = dynamicValue;       
        beat.crescendo = crescendo;
        
        return beat;    
    }
    
    public inline function hasTuplet()
    {
        return !(tupletDenominator == -1 && tupletNumerator == -1) &&
               !(tupletDenominator == 1 && tupletNumerator == 1);
    }
    
    /**
     * Calculates the time spent in this bar. (unit: midi ticks)
     */
    public function calculateDuration() : Int
    {
        var ticks = MidiUtils.durationToTicks(duration);
        if (dots == 2)
        {
            ticks = MidiUtils.applyDot(ticks, true);
        }
        else if (dots == 1)
        {
            ticks = MidiUtils.applyDot(ticks, false);
        }
        
        if (tupletDenominator > 0 && tupletNumerator >= 0)
        {
            ticks = MidiUtils.applyTuplet(ticks, tupletNumerator, tupletDenominator);
        }
        
        return ticks;
    }
    
    public function addNote(note:Note) : Void
    {
        note.beat = this;
        notes.push(note);
       
    }
    
    public function refreshNotes()
    {
        for (n in notes)
        {
            if (_minNote == null || n.realValue() < _minNote.realValue())
            {
                _minNote = n;
            }
            if (_maxNote == null || n.realValue() > _maxNote.realValue())
            {
                _maxNote = n;
            }
        }
    }
    
    public function getAutomation(type:AutomationType) : Automation
    {
        for (a in automations)
        {
            if (a.type == type)
            {
                return a;
            }
        }
        return null;
    }
    
    public function getNoteOnString(string:Int) : Note
    {
        for (n in notes)
        {
            if (n.string == string)
            {
                return n;
            }
        }
        return null;
    }
    
    public function finish()
    {
        if (voice.bar.index == 0 && index == 0)
        {
            start = 0;
            previousBeat = null;
        }
        else
        {
            if (index == 0)
            {
                previousBeat = voice.bar.previousBar.voices[voice.index].beats[voice.bar.previousBar.voices[voice.index].beats.length - 1];
            }
            else
            {
                previousBeat = voice.beats[index - 1];
            }
            previousBeat.nextBeat = this;
            start = previousBeat.start + previousBeat.calculateDuration();
        }
        
        for (n in notes)
        {
            n.finish();
        }
    }
}