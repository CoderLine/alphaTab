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
import alphatab.model.TimeSignature;

/**
 * This class provides methods for wrapping midi messages into the string-format. 
 */
class MidiMessageDataUtils 
{
    public static inline var TICK_MOVE:Int = 0x01;
    
    private static function fixValue(value:Int):Int
    {
        var fixedValue:Int = value;
        fixedValue = cast Math.min(fixedValue,127);
        fixedValue = cast Math.max(fixedValue,0);
        return fixedValue;
    }
    
    private static function fixChannel(channel:Int):Int
    {
        var fixedChannel:Int = channel;
        fixedChannel = cast Math.min(fixedChannel,15);
        fixedChannel = cast Math.max(fixedChannel,0);
        return fixedChannel;
    }
    
    public static function noteOn(channel:Int, note:Int, velocity:Int):String
    {
        // NoteOn,Channel,Note,Velocity
        return "0" + channelToString(fixChannel(channel)) + valueToString(fixValue(note)) + valueToString(fixValue(velocity));
    }
    
    public static function noteOff(channel:Int, note:Int, velocity:Int):String 
    {
        // NoteOff,Channel,Note,Velocity
        return "1" + channelToString(fixChannel(channel)) + valueToString(fixValue(note)) + valueToString(fixValue(velocity));
    }
    
    public static function controlChange(channel:Int, controller:Int, value:Int):String 
    {
        // ControlChange,Channel,Controller,Value
        return "2" + channelToString(fixChannel(channel)) + valueToString(fixValue(controller)) + valueToString(fixValue(value));
    }
    
    public static function programChange(channel:Int, instrument:Int):String 
    {
        // ProgramChange,Channel,Instrument
        return "3" + channelToString(fixChannel(channel)) + valueToString(fixValue(instrument));
    }
    
    public static function pitchBend(channel:Int, value:Int):String
    {
        // PitchBend,Channel,Value
        return "4" + channelToString(fixChannel(channel)) + valueToString(fixValue(value));
    }
     
    public static function tempoInUSQ(usq:Int):String 
    {
        return "5" + intToString(usq);
    }
    
    public static function timeSignature(ts:TimeSignature) : String
    {
        // TimeSignature,Numerator,DenominatorIndex,DenominatorValue
        return "6" + intToString(ts.numerator) + "," + intToString(ts.denominator.index()) + "," + intToString(ts.denominator.value);
    }
    
    public static function rest():String
    {
        // SysEx 
        return "7";
    }
    
    public static inline function intToString(num:Int) :String 
    {
        return StringTools.hex(num);
    }    
    
    public static inline function channelToString(num:Int) :String 
    {
        return StringTools.hex(num, 1);
    }    
    
    public static inline function valueToString(num:Int) :String 
    {
        return StringTools.hex(num, 2);
    }
}