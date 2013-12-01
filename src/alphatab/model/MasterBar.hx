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

/**
 * The MasterBar stores information about a bar which affects
 * all tracks.
 */
class MasterBar 
{
    /**
     * The maximum alternate endings. 
     */
    public static inline var MaxAlternateEndings = 8;
    
    public var alternateEndings:Int;
    public var nextMasterBar:MasterBar;
    public var previousMasterBar:MasterBar;
    public var index:Int;
    public var keySignature:Int;
    public var isDoubleBar:Bool;
    
    public var isRepeatStart:Bool;
    public inline function isRepeatEnd():Bool { return repeatCount > 0; }
    public var repeatCount:Int;
    public var repeatGroup:RepeatGroup;
 
    public var timeSignatureDenominator:Int;
    public var timeSignatureNumerator:Int;
    
    public var tripletFeel:TripletFeel;
    
    public var section:Section;
    public inline function isSectionStart():Bool { return section != null; }
    
    public var tempoAutomation:Automation;
    public var volumeAutomation:Automation;
    
    public var score:Score;
    
    /**
     * The timeline position of the voice within the whole score. (unit: midi ticks)
     */
    public var start : Int;
    

    public function new() 
    {
        alternateEndings = 0;
        repeatCount = 0;
        index = 0;
        keySignature = 0;
        isDoubleBar = false;
        isRepeatStart = false;
        repeatCount = 0;
        timeSignatureDenominator = 4;
        timeSignatureNumerator = 4;
        tripletFeel = TripletFeel.NoTripletFeel;
        start = 0;
    }
    
    /**
     * Calculates the time spent in this bar. (unit: midi ticks)
     */
    public function calculateDuration() : Int
    {
        return timeSignatureNumerator * MidiUtils.valueToTicks(timeSignatureDenominator);
    }
}