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
import alphatab.audio.MidiUtils;
import haxe.io.Output;

/**
 * A midi file consists of multiple tracks including a
 * info track for multi-track messages and a track for metronome ticks. 
 */
class MidiFile
{
    public var tracks:Array<MidiTrack>;
    
    /**
     * Gets or sets the index of the track used for midi events
     * affecting all tracks. (like the tempo)
     */
    public var infoTrack:Int;
    
    public function new() 
    {
        tracks = new Array<MidiTrack>();
    }
    
    public function createTrack() : MidiTrack
    {
        var track = new MidiTrack();
        track.index = tracks.length;
        track.file = this;
        tracks.push(track);
        return track;
    }
    
    public function writeTo(out:Output)
    {
        out.bigEndian = true;
        
        // magic number "MThd" (0x4D546864)
        out.writeInt32(0x4D546864);
        
        // Header Length 6 (0x00000006)
        out.writeInt32(6);
        
        // format 
        out.writeInt16(1);
        
        // number of tracks
        out.writeInt16(tracks.length);
        out.writeInt16(MidiUtils.QuarterTime);

        for (t in tracks)
        {
            t.writeTo(out);            
        }
    }
}