package net.alphatab.midi;
import haxe.io.Bytes;
import net.alphatab.model.TimeSignature;

/**
 * This class provides methods for wrapping midi messages into the string-format. 
 */
class MidiMessageUtils 
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
	
	public static function systemReset() : String 
	{
		return "5";
	}
	 
	public static function tempoInUSQ(usq:Int):String 
	{
		return "6" + intToString(usq);
	}
	
	public static function timeSignature(ts:TimeSignature) : String
	{
		// TimeSignature,Numerator,DenominatorIndex,DenominatorValue
		return "7" + intToString(ts.numerator) + "," + intToString(ts.denominator.index()) + "," + intToString(ts.denominator.value);
	}
	
	public static function intToString(num:Int) :String 
	{
		return StringTools.hex(num);
	}	
	
	public static function channelToString(num:Int) :String 
	{
		return StringTools.hex(num, 1);
	}	
	
	public static function valueToString(num:Int) :String 
	{
		return StringTools.hex(num, 2);
	}
}