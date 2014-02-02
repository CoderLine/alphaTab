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
import haxe.io.Output;

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
    
    #if (cs || java)
    
    public function writeToFile(path:String)
    {
        writeTo(sys.io.File.write(path, true));
    }
    
    #end
    
    public function writeTo(out:Output)
    {
        writeVariableInt(out, getDeltaTicks());
        message.writeTo(out);
    }
    
    private function writeVariableInt(out:Output, value:Int)
    {
        var v = value;
        var array = [0, 0, 0, 0];
        
        var n = 0;
        do 
        {
            array[n++] = (v & 0x7F) & 0xFF;
            v >>= 7;
        } while (v > 0);
        
        while (n > 0)
        {
            n--;
            if (n > 0)
                out.writeByte(array[n] | 0x80);
            else    
                out.writeByte(array[n]);
        }
    }
}