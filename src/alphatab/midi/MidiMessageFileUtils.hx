/*
 * This file is part of alphaTab.
 *
 *  alphaTab is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  alphaTab is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with alphaTab.  If not, see <http://www.gnu.org/licenses/>.
 */
package alphatab.midi;
import alphatab.io.Byte;
import alphatab.midi.model.MidiFile;
import alphatab.midi.model.MidiMessage;
import alphatab.model.TimeSignature;

/**
 * This class creates binary data for midi commands 
 */
class MidiMessageFileUtils 
{  
    public static inline var TICK_MOVE:Int = 0x01;
    
    private static function fixValue(value:Byte):Byte
    {
        if (value < 0) return 0;
        if (value > 127) return 127;
        return value;
    }
    
    private static function fixChannel(value:Byte):Byte
    {
        if (value < 0) return 0;
        if (value > 15) return 15;
        return value;
    }
    
    public static function noteOff(channel:Byte, note:Byte, velocity:Byte):MidiMessage
    {
        // NoteOff,Channel,Note,Velocity
        return new MidiMessage([makeCommand(0x80, channel), fixValue(note), fixValue(velocity)]);
    }
    
    public static function noteOn(channel:Byte, note:Byte, velocity:Byte):MidiMessage
    {
        // NoteOn,Channel,Note,Velocity  
        return new MidiMessage([makeCommand(0x90, channel), fixValue(note), fixValue(velocity)]);
    }
     
    public static inline var REST_MESSAGE:Byte = 0x00;
    public static function rest():MidiMessage
    {
        // SysEx 
        return new MidiMessage([0xF0, 0x00, REST_MESSAGE, 0xF7]);
    }
    
    public static function controlChange(channel:Byte, controller:Byte, value:Byte):MidiMessage 
    {
        // ControlChange,Channel,Controller,Value
        return new MidiMessage([makeCommand(0xB0, channel), fixValue(controller), fixValue(value)]);
    }
    
    public static function programChange(channel:Byte, instrument:Byte):MidiMessage 
    {
        // ProgramChange,Channel,Instrument
        return new MidiMessage([makeCommand(0xC0, channel), fixValue(instrument)]);
    }
    
    public static function pitchBend(channel:Byte, value:Byte):MidiMessage
    {
        // PitchBend,Channel,Value
        return new MidiMessage([makeCommand(0xE0, channel), 0, fixValue(value)]);
    }
    
    private static function makeCommand(command:Byte, channel:Byte)
    {
        return (command & 0xF0) | (channel & 0x0F);
    }
    
    private static function buildSysexMessage(data:Array<Byte> = null)
    {
        var sysex = new Array<Byte>();
        
        sysex.push(0xF0);
        // manufacturer
        
        if (data == null)
        {
            data = new Array<Byte>();
        }
        data.push(0xF7);

        MidiFile.writeVariableLengthValue(sysex, data.length);
        sysex = sysex.concat(data);
        
        return new MidiMessage(sysex);
    }
    
    private static function buildMetaMessage(metaType:Byte, data:Array<Byte> = null)
    {
        var meta = new Array<Byte>();
        
        meta.push(0xFF);
        meta.push(metaType & 0xFF);
        
        if (data == null)
        {
            MidiFile.writeVariableLengthValue(meta, 0);
        }
        else
        {
            MidiFile.writeVariableLengthValue(meta, data.length);
            meta = meta.concat(data);
        }
        
        return new MidiMessage(meta);
    }

     
    public static function tempoInUSQ(usq:Int):MidiMessage 
    {
        return buildMetaMessage(0x51, [(usq >> 16) & 0xFF, (usq >> 8) & 0xFF, usq & 0xFF]);
    }
    
    public static function timeSignature(ts:TimeSignature) : MidiMessage
    {
        // TimeSignature,Numerator,DenominatorIndex,DenominatorValue
        return buildMetaMessage(0x58, [ts.numerator & 0xFF, ts.denominator.index() & 0xFF, 48, 8]);
    }
}