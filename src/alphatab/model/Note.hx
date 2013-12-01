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

/**
 * A note is a single played sound on a fretted instrument. 
 * It consists of a fret offset and a string on which the note is played on.
 * It also can be modified by a lot of different effects.  
 */
class Note 
{
    /**
     * Unknown type (not documented)
     */
    public static inline var FingeringUnknown = -2;
    /**
     * No finger, dead note
     */
    public static inline var FingeringNoOrDead = -1;
    /**
     * The thumb
     */
    public static inline var FingeringThumb = 0;
    /**
     * The index finger
     */
    public static inline var FingeringIndexFinger = 1;
    /**
     * The middle finger
     */
    public static inline var FingeringMiddleFinger = 2;
    /**
     * The annular finger
     */
    public static inline var FingeringAnnularFinger = 3;
    /**
     * The little finger
     */
    public static inline var FingeringLittleFinger = 4;

    
    public var accentuated:AccentuationType;
    public var bendPoints:Array<BendPoint>;
    public inline function hasBend():Bool { return bendPoints.length > 1; }
    public var fret:Int;
    public var isGhost:Bool;
    public var string:Int;
    public var hammerPullOrigin:Note;
    public var isHammerPullDestination:Bool;
    public var isHammerPullOrigin:Bool;
    public var harmonicValue:Float;
    public var harmonicType:HarmonicType;
    public var isLetRing:Bool;
    public var isPalmMute:Bool;
    public var isDead:Bool;
    public var slideType:SlideType;
    public var slideTarget:Note;
    public var vibrato:VibratoType;
    public var isStaccato:Bool;
    public var tieOrigin:Note;
    public var isTieOrigin:Bool;
    public var isTieDestination:Bool;
    
    public var leftHandFinger:Int;
    public var rightHandFinger:Int;
    public var isFingering:Bool;
    
    
    public var trillValue:Int;
    public inline function trillFret():Int { return trillValue - stringTuning(); }
    public inline function isTrill():Bool { return trillValue >= 0; }
    public var trillSpeed:Duration;
    public var durationPercent:Float;
    
    public var swapAccidentals:Bool;
    
    public var beat:Beat;
    public var dynamicValue:DynamicValue;
    
    public var octave:Int;

    public function new() 
    {
        bendPoints = new Array<BendPoint>();
        dynamicValue = DynamicValue.F;
        
        accentuated = AccentuationType.None;
        fret = -1;
        isGhost = false;
        string = 0;
        isHammerPullDestination = false;
        isHammerPullOrigin = false;
        harmonicValue = 0;
        harmonicType = HarmonicType.None;
        isLetRing = false;
        isPalmMute = false;
        isDead = false;
        slideType = SlideType.None;
        vibrato = VibratoType.None;
        isStaccato = false;
        isTieOrigin = false;
        isTieDestination = false;
        
        leftHandFinger = -1;
        rightHandFinger = -1;
        isFingering = false;
        
        swapAccidentals = false;
        
        trillValue = -1;
        trillSpeed = Duration.ThirtySecond;
        durationPercent = 1;
        octave = -1;
    }
    
    public function clone() : Note
    {
        var n = new Note();
        for (p in bendPoints)
        {
            n.bendPoints.push(p.clone());
        }
        n.dynamicValue = dynamicValue;
        n.accentuated = accentuated;
        n.fret = fret;
        n.isGhost = isGhost;
        n.string = string;
        n.isHammerPullDestination = isHammerPullDestination;
        n.isHammerPullOrigin = isHammerPullOrigin;
        n.harmonicValue = harmonicValue;
        n.harmonicType = harmonicType;
        n.isLetRing = isLetRing;
        n.isPalmMute = isPalmMute;
        n.isDead = isDead;
        n.slideType = slideType;
        n.vibrato = vibrato;
        n.isStaccato = isStaccato;
        n.isTieOrigin = isTieOrigin;
        n.isTieDestination = isTieDestination;
        n.leftHandFinger = leftHandFinger;
        n.rightHandFinger = rightHandFinger;
        n.isFingering = n.isFingering;
        n.swapAccidentals = swapAccidentals;
        n.trillValue = trillValue;
        n.trillSpeed = trillSpeed;
        n.durationPercent = durationPercent;        
        
        return n;
    }
    
    public inline function stringTuning() : Int
    {
        return beat.voice.bar.track.tuning[beat.voice.bar.track.tuning.length - (string - 1) - 1];
    }
    
    public inline function realValue() : Int
    {
        return fret + stringTuning();
    }
}