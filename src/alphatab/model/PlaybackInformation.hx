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
 * This class stores the midi specific information of a track needed
 * for playback.
 */
class PlaybackInformation 
{
    public var volume:Int;
    public var balance:Int;
    
    public var port:Int;
    public var program:Int;
    public var primaryChannel:Int;
    public var secondaryChannel:Int;
    
    public var isMute:Bool;
    public var isSolo:Bool;

    
    public function new() 
    {
        volume = 15;
        balance = 8;
        port = 1;
    }
    
}