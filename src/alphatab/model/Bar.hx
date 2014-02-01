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
using alphatab.model.ModelUtils;

/**
 * A bar is a single block within a track, also known as Measure.
 */
class Bar 
{
    public var index:Int;
    public var nextBar:Bar;
    public var previousBar:Bar;
    
    public var clef:Clef;
    
    public var track:Track;
    public var voices:Array<Voice>;
    
    public var minDuration:Null<Duration>;
    public var maxDuration:Null<Duration>;

    
    public function new() 
    {
        voices = new Array<Voice>();
        clef = Clef.G2;
    }
    
    public function addVoice(voice:Voice)
    {
        voice.bar = this;
        voice.index = voices.length;
        voices.push(voice);
    }
    
    public inline function getMasterBar() : MasterBar
    {
        return track.score.masterBars[index];
    }
    
    public function isEmpty() : Bool
    {
        for (v in voices)
        {
            if (!v.isEmpty())
            {
                return false;
            }
        }
        return true;
    }
    
    public function finish()
    {
        for (v in voices)
        {
            v.finish();
            if (v.minDuration == null || minDuration == null || minDuration.getDurationValue() > v.minDuration.getDurationValue())
            {
                minDuration = v.minDuration;
            }
            if (v.maxDuration == null || maxDuration == null || maxDuration.getDurationValue() < v.maxDuration.getDurationValue())
            {
                maxDuration = v.maxDuration;
            }            
        }
    }
}