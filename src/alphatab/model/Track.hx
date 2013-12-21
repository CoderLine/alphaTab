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
import alphatab.platform.model.Color;
import haxe.ds.StringMap.StringMap;

/**
 * This class describes a single track or instrument of score
 */
class Track 
{
    public var capo:Int;
    public var index:Int;
    public var name:String;
    public var shortName:String;
    public var tuning:Array<Int>;
    public var tuningName:String;
    public var color:Color;

    public var playbackInfo:PlaybackInformation;
    public var isPercussion:Bool;
    
    public var score:Score;
    public var bars:Array<Bar>;
    
    public var chords:StringMap<Chord>;
    
    public function new() 
    {
        tuning = new Array<Int>();
        bars = new Array<Bar>();
        chords = new StringMap<Chord>();
        playbackInfo = new PlaybackInformation();
        color = new Color(200, 0, 0);
    }
    
    public function addBar(bar:Bar)
    {
        bar.track = this;
        bar.index = bars.length;
        if (bars.length > 0)
        {
            bar.previousBar = bars[bars.length - 1];
            bar.previousBar.nextBar = bar;
        }
        bars.push(bar);
    }
    
}