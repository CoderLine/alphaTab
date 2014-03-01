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
import alphatab.audio.model.MidiEvent;
import alphatab.audio.model.MidiFile;
import alphatab.audio.model.MidiMessage;
import alphatab.model.DynamicValue;
import haxe.io.Bytes;
import haxe.io.BytesData;

/**
 * This handler is responsible for writing midi events
 * to a MidiFile object.
 */
class MidiFileHandler implements IMidiFileHandler
{
    public static inline var DefaultMetronomeKey:Int = 0x25;
    public static inline var DefaultDurationDead:Int = 30;
    public static inline var DefaultDurationPalmMute:Int = 80;

    public static inline var RestMessage:Int = 0x00;

    private var _midiFile:MidiFile;
    private var _metronomeTrack:Int;
    
    public function new(midiFile:MidiFile) 
    {
        _midiFile = midiFile;
        _metronomeTrack = -1;
    }
    
    private function addEvent(track:Int, tick:Int, message:MidiMessage) :Void
    {
        _midiFile.tracks[track].addEvent(new MidiEvent(tick, message));
    }     
    
    private static inline function makeCommand(command:Int, channel:Int)
    {
        return (command & 0xF0) | (channel & 0x0F);
    }
    
    private static function fixValue(value:Int):Int
    {
        if (value < 0) return 0;
        if (value > 127) return 127;
        return value;
    }
    
    private static function fixChannel(value:Int):Int
    {
        if (value < 0) return 0;
        if (value > 15) return 15;
        return value;
    }    
    
    public function addTimeSignature(tick:Int, timeSignatureNumerator:Int, timeSignatureDenominator:Int)
    {
        var denominatorIndex:Int = 0;
        while((timeSignatureDenominator = (timeSignatureDenominator >> 1)) > 0)
        {
            denominatorIndex++;
        }    
        addEvent(_midiFile.infoTrack, tick, buildMetaMessage(0x58, [timeSignatureNumerator & 0xFF, denominatorIndex & 0xFF, 48, 8]));
    }
    
    public function addRest(track:Int, tick:Int, channel:Int)
    {
        addEvent(track, tick, buildSysExMessage([RestMessage]));
    }
    
    public function addNote(track:Int, start:Int, length:Int, key:Int, dynamicValue:DynamicValue, channel:Int)
    {
        var velocity = MidiUtils.dynamicToVelocity(dynamicValue);
        addEvent(track, start, MidiMessage.fromArray([makeCommand(0x90, channel), fixValue(key), fixValue(velocity)]));
        addEvent(track, start + length, MidiMessage.fromArray([makeCommand(0x80, channel), fixValue(key), fixValue(velocity)]));
    }
    
    public function addControlChange(track:Int, tick:Int, channel:Int, controller:Int, value:Int)
    {
        addEvent(track, tick, MidiMessage.fromArray([makeCommand(0xB0, channel), fixValue(controller), fixValue(value)]));
    }    
    
    public function addProgramChange(track:Int, tick:Int, channel:Int, program:Int)
    {
        addEvent(track, tick, MidiMessage.fromArray([makeCommand(0xC0, channel), fixValue(program)]));
    }    
    
    public function addTempo(tick:Int, tempo:Int)
    {
        // bpm -> microsecond per quarter note
        var tempoInUsq = Std.int(60000000 / tempo);
        addEvent(_midiFile.infoTrack, tick, buildMetaMessage(0x51, [(tempoInUsq >> 16) & 0xFF, (tempoInUsq >> 8) & 0xFF, tempoInUsq & 0xFF]) );
    }
    
    public function addBend(track:Int, tick:Int, channel:Int, value:Int)
    {
        addEvent(track, tick, MidiMessage.fromArray([makeCommand(0xE0, channel), 0, fixValue(value)]));
    }
    
    public function addMetronome(tick:Int, length:Int)
    {
        if (_metronomeTrack == -1)
        {
            _midiFile.createTrack();
            _metronomeTrack = _midiFile.tracks.length -1;
        }
        addNote(_metronomeTrack, tick, length, DefaultMetronomeKey, DynamicValue.F, MidiUtils.PercussionChannel);
    }
 
    private static function buildMetaMessage(metaType:Int, data:Array<Int>)
    {
        var meta = new Array<Int>();
        
        meta.push(0xFF);
        meta.push(metaType & 0xFF);

        writeVarInt(meta, data.length);
        meta = meta.concat(data); 
        
        return MidiMessage.fromArray(meta);
    }
 
    private static function writeVarInt(data:Array<Int>, v:Int)
    {
        var n = 0;
        var array = [0, 0, 0, 0];
        do
        {
            array[n++] = (v & 0x7F) & 0xFF;
            v >>= 7;
        } while (v > 0);
        
        while (n > 0)
        {
            n--;
            if (n > 0)
                data.push((array[n] | 0x80) & 0xFF);
            else    
                data.push(array[n]);
        }
        return n;
    }
    
    private static function buildSysExMessage(data:Array<Int>)
    {
        var sysex = new Array<Int>();
        
        sysex.push(0xF0); // status 
        writeVarInt(sysex, data.length + 2); // write length of data
        sysex.push(0x00); // manufacturer id
        sysex = sysex.concat(data); // data
        sysex.push(0xF7); // end of data
        
        return MidiMessage.fromArray(sysex);
    }
}