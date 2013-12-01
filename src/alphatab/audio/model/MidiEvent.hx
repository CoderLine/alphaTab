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
package alphatab.audio.model;

/**
 * A midi event is a timed midi message. 
 */
class MidiEvent
{
    public var track:MidiTrack;
    public var tick:Int;
    public var message:MidiMessage;
    public var nextEvent:MidiEvent;
    public var previousEvent:MidiEvent;

    public function new(tick:Int, message:MidiMessage) 
    {
        this.tick = tick;
        this.message = message;
    }
    
    public function getDeltaTicks()
    {
        return previousEvent == null ? 0 : tick - previousEvent.tick;
    }
}